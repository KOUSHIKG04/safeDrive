import type { DriveEventType } from "./types";

export const SENSOR_UPDATE_INTERVAL_MS = 100;
export const UI_UPDATE_INTERVAL_MS = 250;
export const MAX_EVENT_LOG_SIZE = 80;

export const EVENT_LABELS: Record<DriveEventType, string> = {
  harshBraking: "Harsh Braking",
  harshAcceleration: "Harsh Acceleration",
  sharpTurn: "Sharp Turn",
  phoneHandling: "Phone Handling",
  aggressiveSteering: "Aggressive Steering",
  excessiveMovement: "Device Movement",
};

export const SCORE_PENALTIES: Record<DriveEventType, number> = {
  harshBraking: 5,
  harshAcceleration: 5,
  sharpTurn: 3,
  aggressiveSteering: 4,
  excessiveMovement: 4,
  phoneHandling: 10,
};

export const EVENT_COOLDOWN_MS: Record<DriveEventType, number> = {
  harshBraking: 2500,
  harshAcceleration: 2500,
  sharpTurn: 1800,
  aggressiveSteering: 1500,
  excessiveMovement: 2200,
  phoneHandling: 4500,
};

export const DETECTION_THRESHOLDS = {
  harshBrakeForwardG: -0.42,
  harshAccelerationForwardG: 0.42,
  sharpTurnLateralG: 0.5,
  sharpTurnHeadingChangeDegrees: 14,
  aggressiveSteeringZRadPerSecond: 2.2,
  excessiveMovementRawG: 1.65,
  excessiveMovementLinearG: 1.15,
  phoneHandlingGyroRadPerSecond: 3.1,
  phoneHandlingRotationDegPerSecond: 170,
  phoneHandlingLinearG: 0.65,
};

export const EMPTY_BREAKDOWN = {
  harshBraking: 0,
  harshAcceleration: 0,
  sharpTurn: 0,
  aggressiveSteering: 0,
  excessiveMovement: 0,
  phoneHandling: 0,
};
