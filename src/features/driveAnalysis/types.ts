import type {
  AccelerometerMeasurement,
  DeviceMotionMeasurement,
  GyroscopeMeasurement,
  MagnetometerMeasurement,
} from "expo-sensors";

export type DriveStatus = "idle" | "driving" | "completed";

export type DriveEventType =
  | "harshBraking"
  | "harshAcceleration"
  | "sharpTurn"
  | "aggressiveSteering"
  | "excessiveMovement"
  | "phoneHandling";

export type SensorName =
  | "accelerometer"
  | "gyroscope"
  | "deviceMotion"
  | "magnetometer";

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type SensorAvailability = Record<SensorName, boolean>;

export type LatestSensorReadings = {
  accelerometer: AccelerometerMeasurement | null;
  gyroscope: GyroscopeMeasurement | null;
  deviceMotion: DeviceMotionMeasurement | null;
  magnetometer: MagnetometerMeasurement | null;
};

export type DerivedTelemetry = {
  forwardG: number;
  lateralG: number;
  verticalG: number;
  linearAccelerationG: number;
  rawAccelerationG: number;
  gyroRadPerSecond: number;
  gyroZRadPerSecond: number;
  rotationRateDegPerSecond: number;
  headingDegrees: number | null;
  headingChangeDegrees: number;
};

export type DriveEvent = {
  id: string;
  type: DriveEventType;
  label: string;
  penalty: number;
  timestamp: number;
  elapsedMs: number;
  intensity: number;
  detail: string;
  sensor: SensorName;
  location: RoutePoint | null;
};

export type EventBreakdown = Record<DriveEventType, number>;

export type RoutePoint = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  elapsedMs: number;
};

export type DriveSummary = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  totalEvents: number;
  score: number;
  rating: string;
  breakdown: EventBreakdown;
  route: RoutePoint[];
  events: DriveEvent[];
};
