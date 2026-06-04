import { EMPTY_BREAKDOWN, EVENT_LABELS, SCORE_PENALTIES } from "./thresholds";
import type { DriveEvent, DriveEventType, EventBreakdown } from "./types";

export function buildEventBreakdown(events: DriveEvent[]): EventBreakdown {
  const breakdown: EventBreakdown = { ...EMPTY_BREAKDOWN };

  for (const event of events) {
    breakdown[event.type] += 1;
  }

  return breakdown;
}

export function calculateDrivingScore(events: DriveEvent[]): number {
  const totalPenalty = events.reduce((sum, event) => sum + event.penalty, 0);
  return Math.max(0, 100 - totalPenalty);
}

export function getSafetyRating(score: number): string {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 60) {
    return "Caution";
  }

  return "High Risk";
}

export function getFeedback(score: number, breakdown: EventBreakdown): string {
  if (score >= 90) {
    return "This was a smooth and controlled driving session with very few risky motion patterns detected. Keep the phone mounted securely and continue using gentle braking, acceleration, and steering inputs.";
  }

  const highestEvent = Object.entries(breakdown).sort(
    (a, b) => b[1] - a[1],
  )[0] as [DriveEventType, number] | undefined;

  if (!highestEvent || highestEvent[1] === 0) {
    return "No major driving events were detected in this session. A longer drive will give the app more sensor data, which can make the safety summary more useful and accurate.";
  }

  const improvementArea = EVENT_LABELS[highestEvent[0]].toLowerCase();

  return `This drive shows a clear pattern around ${improvementArea}, which had the strongest impact on the safety score. For the next trip, focus on smoother phone stability and more gradual vehicle inputs so the motion sensors record fewer high-intensity events.`;
}

export { EVENT_LABELS, SCORE_PENALTIES };
