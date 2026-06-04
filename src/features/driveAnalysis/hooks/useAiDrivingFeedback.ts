import { useEffect, useState } from "react";
import {
  GeminiApiKeyInvalidError,
  GeminiApiKeyMissingError,
  generateAiDrivingFeedback,
} from "../aiFeedback";
import { getFeedback } from "../scoring";
import type { DriveEvent, DriveStatus, EventBreakdown } from "../types";
import { wait } from "@/shared/utils/time";

const MIN_AI_LOADING_MS = 1800;

type AiFeedbackStatus =
  | "idle"
  | "loading"
  | "success"
  | "missingKey"
  | "invalidKey"
  | "error";

type UseAiDrivingFeedbackInput = {
  status: DriveStatus;
  elapsedMs: number;
  events: DriveEvent[];
  breakdown: EventBreakdown;
  score: number;
  rating: string;
};

export function useAiDrivingFeedback({
  status,
  elapsedMs,
  events,
  breakdown,
  score,
  rating,
}: UseAiDrivingFeedbackInput) {
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] =
    useState<AiFeedbackStatus>("idle");
  const fallbackFeedback =
    status === "completed"
      ? getFeedback(score, breakdown)
      : "End a drive to generate session feedback.";
  const feedback = aiFeedback ?? fallbackFeedback;
  const isGenerating =
    status === "completed" && feedbackStatus === "loading";

  useEffect(() => {
    if (status !== "completed") {
      setAiFeedback(null);
      setFeedbackStatus("idle");
      return;
    }

    let isActive = true;

    setAiFeedback(null);
    setFeedbackStatus("loading");

    async function generateFeedback() {
      try {
        const [nextFeedback] = await Promise.all([
          generateAiDrivingFeedback({
            durationMs: elapsedMs,
            totalEvents: events.length,
            score,
            rating,
            breakdown,
            events,
          }),
          wait(MIN_AI_LOADING_MS),
        ]);

        if (!isActive) {
          return;
        }

        setAiFeedback(nextFeedback);
        setFeedbackStatus("success");
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setAiFeedback(null);

        if (error instanceof GeminiApiKeyMissingError) {
          setFeedbackStatus("missingKey");
          return;
        }

        setFeedbackStatus(
          error instanceof GeminiApiKeyInvalidError ? "invalidKey" : "error",
        );
      }
    }

    generateFeedback();

    return () => {
      isActive = false;
    };
  }, [breakdown, elapsedMs, events, rating, score, status]);

  return {
    feedback,
    isGenerating,
  };
}
