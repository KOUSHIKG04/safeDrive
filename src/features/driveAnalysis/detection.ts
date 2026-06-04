import {
  DETECTION_THRESHOLDS,
  EVENT_COOLDOWN_MS,
  EVENT_LABELS,
  SCORE_PENALTIES,
} from "./thresholds";
import type {
  DerivedTelemetry,
  DriveEvent,
  DriveEventType,
  LatestSensorReadings,
  SensorName,
  Vector3,
} from "./types";

const GRAVITY_MS2 = 9.80665;

type DetectionContext = {
  now: number;
  elapsedMs: number;
  readings: LatestSensorReadings;
  previousHeadingDegrees: number | null;
  lastEventAt: Partial<Record<DriveEventType, number>>;
};

type EventCandidate = {
  type: DriveEventType;
  sensor: SensorName;
  intensity: number;
  detail: string;
};

export function deriveTelemetry(
  readings: LatestSensorReadings,
  previousHeadingDegrees: number | null,
): DerivedTelemetry {
  const accelerometer = readings.accelerometer;
  const gyroscope = readings.gyroscope;
  const motionAcceleration = readings.deviceMotion?.acceleration;
  const rotationRate = readings.deviceMotion?.rotationRate;
  const magnetometer = readings.magnetometer;

  const linearG = motionAcceleration
    ? toGVector(motionAcceleration)
    : {
        x: accelerometer?.x ?? 0,
        y: accelerometer?.y ?? 0,
        z: accelerometer ? accelerometer.z - 1 : 0,
      };
  const rawAccelerationG = accelerometer ? magnitude(accelerometer) : 0;
  const headingDegrees = magnetometer
    ? normalizeDegrees(
        (Math.atan2(magnetometer.x, magnetometer.y) * 180) / Math.PI,
      )
    : null;

  return {
    forwardG: linearG.y,
    lateralG: linearG.x,
    verticalG: linearG.z,
    linearAccelerationG: magnitude(linearG),
    rawAccelerationG,
    gyroRadPerSecond: gyroscope ? magnitude(gyroscope) : 0,
    gyroZRadPerSecond: gyroscope?.z ?? 0,
    rotationRateDegPerSecond: rotationRate
      ? magnitude({
          x: rotationRate.alpha,
          y: rotationRate.beta,
          z: rotationRate.gamma,
        })
      : 0,
    headingDegrees,
    headingChangeDegrees:
      headingDegrees === null || previousHeadingDegrees === null
        ? 0
        : angleDeltaDegrees(headingDegrees, previousHeadingDegrees),
  };
}

export function detectDriveEvents(context: DetectionContext): {
  events: DriveEvent[];
  telemetry: DerivedTelemetry;
} {
  const telemetry = deriveTelemetry(
    context.readings,
    context.previousHeadingDegrees,
  );
  const candidates = buildCandidates(telemetry);
  const events: DriveEvent[] = [];

  for (const candidate of candidates) {
    const lastSeenAt = context.lastEventAt[candidate.type] ?? 0;

    if (context.now - lastSeenAt < EVENT_COOLDOWN_MS[candidate.type]) {
      continue;
    }

    context.lastEventAt[candidate.type] = context.now;
    events.push({
      id: `${candidate.type}-${context.now}-${events.length}`,
      type: candidate.type,
      label: EVENT_LABELS[candidate.type],
      penalty: SCORE_PENALTIES[candidate.type],
      timestamp: context.now,
      elapsedMs: context.elapsedMs,
      intensity: candidate.intensity,
      detail: candidate.detail,
      sensor: candidate.sensor,
      location: null,
    });
  }

  return { events, telemetry };
}

function buildCandidates(telemetry: DerivedTelemetry): EventCandidate[] {
  const candidates: EventCandidate[] = [];

  if (telemetry.forwardG <= DETECTION_THRESHOLDS.harshBrakeForwardG) {
    candidates.push({
      type: "harshBraking",
      sensor: "deviceMotion",
      intensity: Math.abs(telemetry.forwardG),
      detail: `${telemetry.forwardG.toFixed(2)} g forward-axis deceleration`,
    });
  }

  if (telemetry.forwardG >= DETECTION_THRESHOLDS.harshAccelerationForwardG) {
    candidates.push({
      type: "harshAcceleration",
      sensor: "deviceMotion",
      intensity: telemetry.forwardG,
      detail: `${telemetry.forwardG.toFixed(2)} g forward-axis acceleration`,
    });
  }

  if (
    Math.abs(telemetry.lateralG) >= DETECTION_THRESHOLDS.sharpTurnLateralG ||
    telemetry.headingChangeDegrees >=
      DETECTION_THRESHOLDS.sharpTurnHeadingChangeDegrees
  ) {
    candidates.push({
      type: "sharpTurn",
      sensor:
        telemetry.headingChangeDegrees > 0 ? "magnetometer" : "deviceMotion",
      intensity: Math.max(
        Math.abs(telemetry.lateralG),
        telemetry.headingChangeDegrees / 20,
      ),
      detail: `${Math.abs(telemetry.lateralG).toFixed(2)} g lateral, ${telemetry.headingChangeDegrees.toFixed(0)} deg heading change`,
    });
  }

  if (
    Math.abs(telemetry.gyroZRadPerSecond) >=
    DETECTION_THRESHOLDS.aggressiveSteeringZRadPerSecond
  ) {
    candidates.push({
      type: "aggressiveSteering",
      sensor: "gyroscope",
      intensity: Math.abs(telemetry.gyroZRadPerSecond),
      detail: `${Math.abs(telemetry.gyroZRadPerSecond).toFixed(2)} rad/s yaw rotation`,
    });
  }

  if (
    telemetry.rawAccelerationG >= DETECTION_THRESHOLDS.excessiveMovementRawG ||
    telemetry.linearAccelerationG >=
      DETECTION_THRESHOLDS.excessiveMovementLinearG
  ) {
    candidates.push({
      type: "excessiveMovement",
      sensor: "accelerometer",
      intensity: Math.max(
        telemetry.rawAccelerationG,
        telemetry.linearAccelerationG,
      ),
      detail: `${telemetry.rawAccelerationG.toFixed(2)} g raw, ${telemetry.linearAccelerationG.toFixed(2)} g linear`,
    });
  }

  if (
    telemetry.linearAccelerationG >=
      DETECTION_THRESHOLDS.phoneHandlingLinearG &&
    (telemetry.gyroRadPerSecond >=
      DETECTION_THRESHOLDS.phoneHandlingGyroRadPerSecond ||
      telemetry.rotationRateDegPerSecond >=
        DETECTION_THRESHOLDS.phoneHandlingRotationDegPerSecond)
  ) {
    candidates.push({
      type: "phoneHandling",
      sensor: "gyroscope",
      intensity: Math.max(
        telemetry.gyroRadPerSecond,
        telemetry.rotationRateDegPerSecond / 60,
      ),
      detail: `${telemetry.gyroRadPerSecond.toFixed(2)} rad/s rotation with ${telemetry.linearAccelerationG.toFixed(2)} g movement`,
    });
  }

  return candidates;
}

function toGVector(vector: Vector3): Vector3 {
  return {
    x: vector.x / GRAVITY_MS2,
    y: vector.y / GRAVITY_MS2,
    z: vector.z / GRAVITY_MS2,
  };
}

function magnitude(vector: Vector3): number {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
}

function normalizeDegrees(degrees: number): number {
  return (degrees + 360) % 360;
}

function angleDeltaDegrees(current: number, previous: number): number {
  const delta = Math.abs(current - previous) % 360;
  return delta > 180 ? 360 - delta : delta;
}
