import { EVENT_LABELS } from "./thresholds";
import type { DriveEvent, EventBreakdown } from "./types";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MIN_CLEAR_FEEDBACK_LENGTH = 70;

type GenerateFeedbackInput = {
  durationMs: number;
  totalEvents: number;
  score: number;
  rating: string;
  breakdown: EventBreakdown;
  events: DriveEvent[];
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
};

export class GeminiApiKeyMissingError extends Error {
  constructor() {
    super("Gemini API key is missing.");
    this.name = "GeminiApiKeyMissingError";
  }
}

export class GeminiApiKeyInvalidError extends Error {
  constructor() {
    super("Gemini API key looks invalid.");
    this.name = "GeminiApiKeyInvalidError";
  }
}

export class GeminiFeedbackUnclearError extends Error {
  constructor() {
    super("Gemini feedback was too short or unclear.");
    this.name = "GeminiFeedbackUnclearError";
  }
}

export async function generateAiDrivingFeedback(
  input: GenerateFeedbackInput,
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiApiKeyMissingError();
  }

  if (apiKey.length < 20 || apiKey === "your_gemini_api_key_here") {
    throw new GeminiApiKeyInvalidError();
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const text = await requestGeminiFeedback(input, apiKey, attempt);

      if (isClearFeedback(text)) {
        return text;
      }

      lastError = new GeminiFeedbackUnclearError();
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Gemini feedback failed.");
    }
  }

  throw lastError ?? new GeminiFeedbackUnclearError();
}

async function requestGeminiFeedback(
  input: GenerateFeedbackInput,
  apiKey: string,
  attempt: number,
): Promise<string> {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: "You are a driving safety coach for a student mobile telematics app. Give concise, practical feedback based only on the provided sensor events. Do not invent GPS, speed, weather, or road details.",
          },
        ],
      },
      contents: [
        {
          parts: [
            {
              text: buildDrivingFeedbackPrompt(input, attempt),
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 180,
        temperature: 0.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with HTTP ${response.status}.`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!text) {
    throw new Error("Gemini did not return feedback text.");
  }

  return text;
}

function buildDrivingFeedbackPrompt(
  input: GenerateFeedbackInput,
  attempt: number,
): string {
  const eventBreakdown = Object.entries(input.breakdown)
    .map(
      ([type, count]) =>
        `${EVENT_LABELS[type as keyof EventBreakdown]}: ${count}`,
    )
    .join(", ");
  const latestEvents =
    input.events.length > 0
      ? input.events
          .slice(0, 5)
          .map((event) => `${event.label} (${event.detail})`)
          .join("; ")
      : "No detected events";
  const clarityInstruction =
    attempt === 0
      ? "Return plain English only. Do not return labels, placeholders, or numbers by themselves."
      : "Your answer must be a clear paragraph of at least 2 complete sentences. Do not answer with only a heading, number, or fragment.";

  return [
    "Generate a short driving session summary in 2-3 sentences.",
    `Duration: ${formatDuration(input.durationMs)}.`,
    `Score: ${input.score}/100.`,
    `Safety rating: ${input.rating}.`,
    `Total events: ${input.totalEvents}.`,
    `Event breakdown: ${eventBreakdown}.`,
    `Latest events: ${latestEvents}.`,
    "End with one specific improvement suggestion.",
    clarityInstruction,
  ].join(" ");
}

function isClearFeedback(text: string): boolean {
  const normalizedText = text.trim();
  const sentenceCount = normalizedText
    .split(/[.!?]+/)
    .filter((sentence) => sentence.trim().length > 12).length;
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;

  return (
    normalizedText.length >= MIN_CLEAR_FEEDBACK_LENGTH &&
    wordCount >= 14 &&
    sentenceCount >= 2
  );
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
