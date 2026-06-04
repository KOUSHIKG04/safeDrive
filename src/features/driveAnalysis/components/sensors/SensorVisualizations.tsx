import { StyleSheet, Text, View } from "react-native";
import { fontStyles } from "@/fontDefaults";
import { clamp, formatNumber } from "@/shared/utils/number";
import { useAppTheme, type ThemeColors } from "@/theme";
import type {
  DerivedTelemetry,
  LatestSensorReadings,
  SensorAvailability,
} from "../../types";

type SensorVisualizationsProps = {
  latestReadings: LatestSensorReadings;
  telemetry: DerivedTelemetry;
  availability: SensorAvailability;
};

export function SensorVisualizations({
  latestReadings,
  telemetry,
  availability,
}: SensorVisualizationsProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <View style={styles.sensorGrid}>
        <AccelerometerPlaneCard
          label="Accelerometer"
          available={availability.accelerometer}
          compact
          colors={colors}
          x={latestReadings.accelerometer?.x}
          y={latestReadings.accelerometer?.y}
          z={latestReadings.accelerometer?.z}
        />
        <GyroscopePlaneCard
          label="Gyroscope"
          available={availability.gyroscope}
          compact
          colors={colors}
          x={latestReadings.gyroscope?.x}
          y={latestReadings.gyroscope?.y}
          z={latestReadings.gyroscope?.z}
        />
        <MotionVisualizerCard
          available={availability.deviceMotion}
          colors={colors}
          forwardG={telemetry.forwardG}
          lateralG={telemetry.lateralG}
          rotation={telemetry.rotationRateDegPerSecond}
        />
        <CompassVisualizerCard
          available={availability.magnetometer}
          colors={colors}
          heading={telemetry.headingDegrees}
          headingChange={telemetry.headingChangeDegrees}
        />
      </View>

      <View
        style={[
          styles.telemetryPanel,
          { backgroundColor: colors.code, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.telemetryTitle, { color: colors.codeForeground }]}>
          Derived Telemetry
        </Text>
        <View style={styles.telemetryGrid}>
          <TelemetryMetric
            label="Linear G"
            value={telemetry.linearAccelerationG}
            colors={colors}
          />
          <TelemetryMetric
            label="Raw G"
            value={telemetry.rawAccelerationG}
            colors={colors}
          />
          <TelemetryMetric
            label="Gyro"
            value={telemetry.gyroRadPerSecond}
            colors={colors}
          />
          <TelemetryMetric
            label="Heading"
            value={telemetry.headingDegrees}
            colors={colors}
          />
        </View>
      </View>
    </>
  );
}

function AccelerometerPlaneCard({
  label,
  available,
  compact,
  colors,
  x,
  y,
  z,
}: {
  label: string;
  available: boolean;
  compact?: boolean;
  colors: ThemeColors;
  x: number | null | undefined;
  y: number | null | undefined;
  z: number | null | undefined;
}) {
  const dotX = clamp((x ?? 0) / 1.5, -1, 1) * 52;
  const dotY = clamp(-(y ?? 0) / 1.5, -1, 1) * 52;
  const zScale = 0.75 + Math.min(Math.abs(z ?? 0) / 2, 1) * 0.5;

  return (
    <View
      style={[
        styles.sensorCard,
        compact && styles.compactSensorCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <SensorCardHeader label={label} available={available} colors={colors} />
      <View style={[styles.planePad, { backgroundColor: colors.muted }]}>
        <View
          style={[styles.planeGridVertical, { backgroundColor: colors.border }]}
        />
        <View
          style={[
            styles.planeGridHorizontal,
            { backgroundColor: colors.border },
          ]}
        />
        <View
          style={[
            styles.accelRipple,
            { borderColor: colors.primary, transform: [{ scale: zScale }] },
          ]}
        />
        <View
          style={[
            styles.planeDot,
            {
              backgroundColor: colors.primary,
              transform: [{ translateX: dotX }, { translateY: dotY }],
            },
          ]}
        />
      </View>
    </View>
  );
}

function GyroscopePlaneCard({
  label,
  available,
  compact,
  colors,
  x,
  y,
  z,
}: {
  label: string;
  available: boolean;
  compact?: boolean;
  colors: ThemeColors;
  x: number | null | undefined;
  y: number | null | undefined;
  z: number | null | undefined;
}) {
  const rotateZ = clamp((z ?? 0) * 28, -70, 70);
  const orbitX = clamp((x ?? 0) / 4, -1, 1) * 36;
  const orbitY = clamp((y ?? 0) / 4, -1, 1) * 36;

  return (
    <View
      style={[
        styles.sensorCard,
        compact && styles.compactSensorCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <SensorCardHeader label={label} available={available} colors={colors} />
      <View style={[styles.gyroStage, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.gyroOuterRing,
            {
              borderColor: colors.primary,
              transform: [{ rotate: `${rotateZ}deg` }],
            },
          ]}
        />
        <View
          style={[
            styles.gyroInnerRing,
            {
              borderColor: colors.syntaxNumber,
              transform: [{ rotate: `${-rotateZ * 0.7}deg` }],
            },
          ]}
        />
        <View
          style={[
            styles.gyroOrbitDot,
            {
              backgroundColor: colors.primary,
              transform: [{ translateX: orbitX }, { translateY: orbitY }],
            },
          ]}
        />
      </View>
    </View>
  );
}

function MotionVisualizerCard({
  available,
  colors,
  forwardG,
  lateralG,
  rotation,
}: {
  available: boolean;
  colors: ThemeColors;
  forwardG: number;
  lateralG: number;
  rotation: number;
}) {
  const x = clamp(lateralG / 1.2, -1, 1) * 44;
  const y = clamp(-forwardG / 1.2, -1, 1) * 44;
  const rotationIntensity = Math.min(Math.abs(rotation) / 220, 1);

  return (
    <View
      style={[
        styles.sensorCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <SensorCardHeader
        label="Device Motion"
        available={available}
        colors={colors}
      />
      <View style={[styles.motionPad, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.motionCrossVertical,
            { backgroundColor: colors.border },
          ]}
        />
        <View
          style={[
            styles.motionCrossHorizontal,
            { backgroundColor: colors.border },
          ]}
        />
        <View
          style={[
            styles.motionBubble,
            {
              backgroundColor: colors.primary,
              transform: [{ translateX: x }, { translateY: y }],
            },
          ]}
        />
      </View>
      <View style={styles.motionFooter}>
        <Text style={[styles.visualHint, { color: colors.mutedForeground }]}>
          Direction
        </Text>
        <View style={[styles.rotationTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.rotationFill,
              {
                backgroundColor: colors.chart3,
                width: `${Math.max(8, rotationIntensity * 100)}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function CompassVisualizerCard({
  available,
  colors,
  heading,
  headingChange,
}: {
  available: boolean;
  colors: ThemeColors;
  heading: number | null;
  headingChange: number;
}) {
  const rotation = heading ?? 0;

  return (
    <View
      style={[
        styles.sensorCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <SensorCardHeader
        label="Magnetometer"
        available={available}
        colors={colors}
      />
      <View style={[styles.compass, { borderColor: colors.border }]}>
        <Text style={[styles.compassNorth, { color: colors.destructive }]}>
          N
        </Text>
        <Text style={[styles.compassEast, { color: colors.mutedForeground }]}>
          E
        </Text>
        <Text style={[styles.compassSouth, { color: colors.mutedForeground }]}>
          S
        </Text>
        <Text style={[styles.compassWest, { color: colors.mutedForeground }]}>
          W
        </Text>
        <View
          style={[
            styles.compassNeedle,
            {
              backgroundColor: colors.primary,
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        />
      </View>
      <Text style={[styles.visualHint, { color: colors.mutedForeground }]}>
        {heading === null
          ? "waiting for heading"
          : `${Math.round(heading)} deg heading, ${Math.round(headingChange)} deg shift`}
      </Text>
    </View>
  );
}

function SensorCardHeader({
  label,
  available,
  colors,
}: {
  label: string;
  available: boolean;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.sensorHeader}>
      <Text style={[styles.sensorTitle, { color: colors.cardForeground }]}>
        {label}
      </Text>
      <View
        style={[
          styles.sensorDot,
          { backgroundColor: available ? colors.syntaxString : colors.input },
        ]}
      />
    </View>
  );
}

function TelemetryMetric({
  label,
  value,
  colors,
}: {
  label: string;
  value: number | null;
  colors: ThemeColors;
}) {
  return (
    <View style={[styles.telemetryMetric, { backgroundColor: colors.accent }]}>
      <Text style={[styles.telemetryLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.telemetryValue, { color: colors.accentForeground }]}>
        {formatNumber(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sensorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sensorCard: {
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 230,
    padding: 12,
  },
  compactSensorCard: {
    flexBasis: "47%",
    minWidth: 150,
  },
  sensorHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sensorTitle: {
    flex: 1,
    fontSize: 14,
    ...fontStyles.extraBold,
  },
  sensorDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  planePad: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    maxHeight: 160,
    overflow: "hidden",
  },
  planeGridVertical: {
    height: "100%",
    opacity: 0.7,
    position: "absolute",
    width: 2,
  },
  planeGridHorizontal: {
    height: 2,
    opacity: 0.7,
    position: "absolute",
    width: "100%",
  },
  accelRipple: {
    borderRadius: 46,
    borderWidth: 2,
    height: 78,
    opacity: 0.75,
    position: "absolute",
    width: 78,
  },
  planeDot: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  gyroStage: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    maxHeight: 160,
    overflow: "hidden",
  },
  gyroOuterRing: {
    alignItems: "center",
    borderRadius: 50,
    borderWidth: 2,
    height: 100,
    justifyContent: "center",
    position: "absolute",
    width: 100,
  },
  gyroInnerRing: {
    borderRadius: 33,
    borderWidth: 2,
    height: 66,
    opacity: 0.9,
    position: "absolute",
    width: 66,
  },
  gyroOrbitDot: {
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  motionPad: {
    alignItems: "center",
    borderRadius: 8,
    height: 150,
    justifyContent: "center",
    overflow: "hidden",
  },
  motionCrossVertical: {
    height: "100%",
    opacity: 0.7,
    position: "absolute",
    width: 2,
  },
  motionCrossHorizontal: {
    height: 2,
    opacity: 0.7,
    position: "absolute",
    width: "100%",
  },
  motionBubble: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  motionFooter: {
    gap: 8,
    marginTop: 10,
  },
  rotationTrack: {
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
  },
  rotationFill: {
    borderRadius: 999,
    height: "100%",
  },
  compass: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 66,
    borderWidth: 1,
    height: 132,
    justifyContent: "center",
    width: 132,
  },
  compassNorth: {
    fontSize: 15,
    ...fontStyles.extraBold,
    position: "absolute",
    top: 8,
  },
  compassEast: {
    fontSize: 12,
    ...fontStyles.extraBold,
    position: "absolute",
    right: 10,
  },
  compassSouth: {
    bottom: 8,
    fontSize: 12,
    ...fontStyles.extraBold,
    position: "absolute",
  },
  compassWest: {
    fontSize: 12,
    ...fontStyles.extraBold,
    left: 10,
    position: "absolute",
  },
  compassNeedle: {
    borderRadius: 3,
    height: 68,
    position: "absolute",
    width: 6,
  },
  visualHint: {
    fontSize: 12,
    ...fontStyles.bold,
    marginTop: 20,
    textAlign: "center",
  },
  telemetryPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  telemetryTitle: {
    fontSize: 18,
    ...fontStyles.extraBold,
  },
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  telemetryMetric: {
    borderRadius: 8,
    flex: 1,
    minWidth: 130,
    padding: 12,
  },
  telemetryLabel: {
    fontSize: 12,
    ...fontStyles.extraBold,
    textTransform: "uppercase",
  },
  telemetryValue: {
    fontSize: 20,
    ...fontStyles.extraBold,
    marginTop: 4,
  },
});
