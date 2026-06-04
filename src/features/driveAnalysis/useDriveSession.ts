import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  Magnetometer,
} from "expo-sensors";
import * as Location from "expo-location";
import { detectDriveEvents, deriveTelemetry } from "./detection";
import { loadDriveHistory, saveDriveSummary } from "./historyStorage";
import { calculateDrivingScore, getSafetyRating } from "./scoring";
import {
  EMPTY_BREAKDOWN,
  MAX_EVENT_LOG_SIZE,
  SENSOR_UPDATE_INTERVAL_MS,
  UI_UPDATE_INTERVAL_MS,
} from "./thresholds";
import type {
  DerivedTelemetry,
  DriveEvent,
  DriveEventType,
  DriveSummary,
  DriveStatus,
  EventBreakdown,
  LatestSensorReadings,
  RoutePoint,
  SensorAvailability,
} from "./types";

const INITIAL_READINGS: LatestSensorReadings = {
  accelerometer: null,
  gyroscope: null,
  deviceMotion: null,
  magnetometer: null,
};

const INITIAL_AVAILABILITY: SensorAvailability = {
  accelerometer: false,
  gyroscope: false,
  deviceMotion: false,
  magnetometer: false,
};

const LOCATION_UPDATE_INTERVAL_MS = 3000;
const LOCATION_UPDATE_DISTANCE_M = 20;

type SensorSubscription = {
  remove: () => void;
};

export function useDriveSession() {
  const [status, setStatus] = useState<DriveStatus>("idle");
  const [events, setEvents] = useState<DriveEvent[]>([]);
  const [latestReadings, setLatestReadings] =
    useState<LatestSensorReadings>(INITIAL_READINGS);
  const [availability, setAvailability] =
    useState<SensorAvailability>(INITIAL_AVAILABILITY);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [driveHistory, setDriveHistory] = useState<DriveSummary[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const statusRef = useRef<DriveStatus>("idle");
  const startTimeRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const eventsRef = useRef<DriveEvent[]>([]);
  const routeRef = useRef<RoutePoint[]>([]);
  const readingsRef = useRef<LatestSensorReadings>(INITIAL_READINGS);
  const lastEventAtRef = useRef<Partial<Record<DriveEventType, number>>>({});
  const subscriptionsRef = useRef<SensorSubscription[]>([]);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUiUpdateAtRef = useRef(0);
  const previousHeadingRef = useRef<number | null>(null);

  const stopSensors = useCallback(() => {
    for (const subscription of subscriptionsRef.current) {
      subscription.remove();
    }

    subscriptionsRef.current = [];

    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }

    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  const appendRoutePoint = useCallback((location: Location.LocationObject) => {
    if (statusRef.current !== "driving" || startTimeRef.current === null) {
      return;
    }

    const nextPoint: RoutePoint = {
      id: `route-${location.timestamp}`,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
      elapsedMs: Date.now() - startTimeRef.current,
    };

    routeRef.current = [...routeRef.current, nextPoint].slice(-240);
    setRoute(routeRef.current);
  }, []);

  const processSample = useCallback(() => {
    if (statusRef.current !== "driving" || startTimeRef.current === null) {
      return;
    }

    const now = Date.now();
    const nextElapsedMs = now - startTimeRef.current;
    const { events: detectedEvents, telemetry } = detectDriveEvents({
      now,
      elapsedMs: nextElapsedMs,
      readings: readingsRef.current,
      previousHeadingDegrees: previousHeadingRef.current,
      lastEventAt: lastEventAtRef.current,
    });

    previousHeadingRef.current = telemetry.headingDegrees;

    if (detectedEvents.length > 0) {
      const detectedEventsWithLocation = detectedEvents.map((event) => ({
        ...event,
        location: routeRef.current[routeRef.current.length - 1] ?? null,
      }));

      eventsRef.current = [...detectedEventsWithLocation, ...eventsRef.current].slice(
        0,
        MAX_EVENT_LOG_SIZE,
      );
      setEvents(eventsRef.current);
    }

    if (now - lastUiUpdateAtRef.current >= UI_UPDATE_INTERVAL_MS) {
      lastUiUpdateAtRef.current = now;
      setLatestReadings({ ...readingsRef.current });
    }
  }, []);

  const startDrive = useCallback(async () => {
    setError(null);

    try {
      stopSensors();
      const nextAvailability = {
        accelerometer: await Accelerometer.isAvailableAsync(),
        gyroscope: await Gyroscope.isAvailableAsync(),
        deviceMotion: await DeviceMotion.isAvailableAsync(),
        magnetometer: await Magnetometer.isAvailableAsync(),
      };

      setAvailability(nextAvailability);

      if (
        !nextAvailability.accelerometer ||
        !nextAvailability.gyroscope ||
        !nextAvailability.deviceMotion
      ) {
        setError("Required motion sensors are not available on this device.");
        return;
      }

      const [, , , , locationPermission] = await Promise.all([
        Accelerometer.requestPermissionsAsync(),
        Gyroscope.requestPermissionsAsync(),
        DeviceMotion.requestPermissionsAsync(),
        Magnetometer.requestPermissionsAsync(),
        Location.requestForegroundPermissionsAsync(),
      ]);

      Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
      Gyroscope.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
      DeviceMotion.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);
      Magnetometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS);

      readingsRef.current = INITIAL_READINGS;
      eventsRef.current = [];
      routeRef.current = [];
      lastEventAtRef.current = {};
      previousHeadingRef.current = null;
      const startedAt = Date.now();
      startTimeRef.current = startedAt;
      startedAtRef.current = startedAt;
      statusRef.current = "driving";
      setStatus("driving");
      setEvents([]);
      setRoute([]);
      setElapsedMs(0);
      setLatestReadings(INITIAL_READINGS);

      subscriptionsRef.current = [
        Accelerometer.addListener((reading) => {
          readingsRef.current = { ...readingsRef.current, accelerometer: reading };
          processSample();
        }),
        Gyroscope.addListener((reading) => {
          readingsRef.current = { ...readingsRef.current, gyroscope: reading };
          processSample();
        }),
        DeviceMotion.addListener((reading) => {
          readingsRef.current = { ...readingsRef.current, deviceMotion: reading };
          processSample();
        }),
      ];

      if (nextAvailability.magnetometer) {
        subscriptionsRef.current.push(
          Magnetometer.addListener((reading) => {
            readingsRef.current = { ...readingsRef.current, magnetometer: reading };
            processSample();
          }),
        );
      }

      if (locationPermission.status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        appendRoutePoint(currentLocation);
        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: LOCATION_UPDATE_DISTANCE_M,
            timeInterval: LOCATION_UPDATE_INTERVAL_MS,
          },
          appendRoutePoint,
        );
      } else {
        setError("Location permission denied. Route replay and heatmap are disabled.");
      }

      elapsedTimerRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsedMs(Date.now() - startTimeRef.current);
        }
      }, 1000);
    } catch (caughtError) {
      stopSensors();
      statusRef.current = "idle";
      setStatus("idle");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not start sensor collection.",
      );
    }
  }, [appendRoutePoint, processSample, stopSensors]);

  const endDrive = useCallback(async () => {
    if (statusRef.current !== "driving") {
      return;
    }

    const endedAt = Date.now();
    const finalElapsedMs =
      startTimeRef.current === null ? elapsedMs : endedAt - startTimeRef.current;
    const finalEvents = eventsRef.current;
    const finalRoute = routeRef.current;
    const finalScore = calculateDrivingScore(finalEvents);
    const finalRating = getSafetyRating(finalScore);
    const finalBreakdown: EventBreakdown = { ...EMPTY_BREAKDOWN };

    for (const event of finalEvents) {
      finalBreakdown[event.type] += 1;
    }

    stopSensors();
    statusRef.current = "completed";
    setStatus("completed");
    setElapsedMs(finalElapsedMs);
    setLatestReadings({ ...readingsRef.current });

    const summary: DriveSummary = {
      id: `drive-${startedAtRef.current ?? endedAt}`,
      startedAt: startedAtRef.current ?? endedAt - finalElapsedMs,
      endedAt,
      durationMs: finalElapsedMs,
      totalEvents: finalEvents.length,
      score: finalScore,
      rating: finalRating,
      breakdown: finalBreakdown,
      route: finalRoute,
      events: finalEvents,
    };

    try {
      setDriveHistory(await saveDriveSummary(summary));
    } catch {
      setError("Drive completed, but history could not be saved.");
    }
  }, [elapsedMs, stopSensors]);

  const resetDrive = useCallback(() => {
    stopSensors();
    statusRef.current = "idle";
    startTimeRef.current = null;
    startedAtRef.current = null;
    readingsRef.current = INITIAL_READINGS;
    eventsRef.current = [];
    routeRef.current = [];
    lastEventAtRef.current = {};
    previousHeadingRef.current = null;
    setStatus("idle");
    setEvents([]);
    setRoute([]);
    setElapsedMs(0);
    setLatestReadings(INITIAL_READINGS);
    setError(null);
  }, [stopSensors]);

  useEffect(() => {
    loadDriveHistory()
      .then(setDriveHistory)
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      stopSensors();
    };
  }, [stopSensors]);

  const score = useMemo(() => calculateDrivingScore(events), [events]);
  const rating = useMemo(() => getSafetyRating(score), [score]);
  const breakdown = useMemo<EventBreakdown>(() => {
    const nextBreakdown: EventBreakdown = { ...EMPTY_BREAKDOWN };

    for (const event of events) {
      nextBreakdown[event.type] += 1;
    }

    return nextBreakdown;
  }, [events]);
  const telemetry = useMemo<DerivedTelemetry>(
    () => deriveTelemetry(latestReadings, previousHeadingRef.current),
    [latestReadings],
  );

  return {
    status,
    elapsedMs,
    events,
    route,
    driveHistory,
    latestReadings,
    telemetry,
    availability,
    score,
    rating,
    breakdown,
    error,
    startDrive,
    endDrive,
    resetDrive,
  };
}
