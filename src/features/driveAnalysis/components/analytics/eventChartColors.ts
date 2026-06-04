import type { DriveEventType } from "../../types";

export const EVENT_ORDER: DriveEventType[] = [
  "harshBraking",
  "harshAcceleration",
  "sharpTurn",
  "aggressiveSteering",
  "excessiveMovement",
  "phoneHandling",
];

export const EVENT_CHART_COLORS: Record<DriveEventType, string> = {
  harshBraking: "#e7000b",
  harshAcceleration: "#f59e0b",
  sharpTurn: "#2563eb",
  aggressiveSteering: "#7c3aed",
  excessiveMovement: "#d08700",
  phoneHandling: "#16a34a",
};
