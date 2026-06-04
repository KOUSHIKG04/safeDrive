import { fontStyles } from "@/fontDefaults";
import { formatDuration } from "@/shared/utils/time";
import { useAppTheme, type ThemeColors } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import type { SensorAvailability } from "../../types";

type DriveScorePanelProps = {
  elapsedMs: number;
  eventCount: number;
  score: number;
  rating: string;
  availability: SensorAvailability;
  isWide: boolean;
};

export function DriveScorePanel({
  elapsedMs,
  eventCount,
  score,
  rating,
  availability,
  isWide,
}: DriveScorePanelProps) {
  const { colors } = useAppTheme();
  const activeSensorCount = Object.values(availability).filter(Boolean).length;
  const allSensorsAvailable = activeSensorCount === 4;

  return (
    <View
      style={[
        styles.scorePanel,
        { backgroundColor: colors.code },
        { alignItems: isWide ? "center" : "stretch" },
      ]}
    >
      <SpeedometerGauge score={score} rating={rating} colors={colors} />
      <View style={styles.summaryColumn}>
        <Metric label="Duration" value={formatDuration(elapsedMs)} />
        <Metric label="Events" value={String(eventCount)} />
        <Metric
          label="Sensors"
          value={String(activeSensorCount)}
          tone={allSensorsAvailable ? "success" : "danger"}
        />
      </View>
    </View>
  );
}

function SpeedometerGauge({
  score,
  rating,
  colors,
}: {
  score: number;
  rating: string;
  colors: ThemeColors;
}) {
  const size = 230;
  const strokeWidth = 18;
  const radius = 86;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const progress = Math.max(0, Math.min(score, 100)) / 100;
  const needleAngle = Math.PI - progress * Math.PI;
  const needleLength = 66;
  const needleX = center + Math.cos(needleAngle) * needleLength;
  const needleY = center - Math.sin(needleAngle) * needleLength;

  return (
    <View style={styles.gaugeWrap}>
      <Text style={[styles.panelLabel, { color: colors.mutedForeground }]}>
        Driving Score and Rating
      </Text>
      <Text style={[styles.ratingText, { color: colors.primary }]}>
        {rating}
      </Text>

      <View style={styles.gaugeBox}>
        <Svg width={size} height={138} viewBox={`0 0 ${size} 138`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.muted}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${halfCircumference} ${circumference}`}
            strokeLinecap="round"
            rotation="180"
            originX={center}
            originY={center}
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${halfCircumference * progress} ${circumference}`}
            strokeLinecap="round"
            rotation="180"
            originX={center}
            originY={center}
          />
          <Line
            x1={center}
            y1={center}
            x2={needleX}
            y2={needleY}
            stroke={colors.codeForeground}
            strokeLinecap="round"
            strokeWidth={4}
          />
          <Circle cx={center} cy={center} r={7} fill={colors.primary} />
        </Svg>
        <View style={styles.gaugeValue}>
          <Text style={[styles.scoreText, { color: colors.codeForeground }]}>
            {score}
          </Text>
        </View>
      </View>
      <View style={styles.gaugeLabels}>
        <Text style={[styles.gaugeLabel, { color: colors.mutedForeground }]}>
          0
        </Text>
        <Text style={[styles.gaugeLabel, { color: colors.mutedForeground }]}>
          100
        </Text>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const { colors } = useAppTheme();
  const valueColor =
    tone === "success"
      ? colors.syntaxString
      : tone === "danger"
        ? colors.destructive
        : colors.accentForeground;

  return (
    <View style={[styles.metric, { backgroundColor: colors.accent }]}>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scorePanel: {
    alignItems: "center",
    borderRadius: 8,
    gap: 14,
    justifyContent: "space-between",
    marginTop: -2,
    padding: 20,
    paddingTop: 28,
    position: "relative",
  },
  gaugeWrap: {
    alignItems: "center",
    alignSelf: "stretch",
  },
  gaugeBox: {
    alignItems: "center",
    height: 156,
    justifyContent: "center",
    marginTop: 4,
    width: "100%",
  },
  gaugeValue: {
    alignItems: "center",
    bottom: 0,
    position: "absolute",
  },
  gaugeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8,
    paddingHorizontal: 26,
    width: 230,
  },
  gaugeLabel: {
    fontSize: 12,
    ...fontStyles.bold,
  },
  panelLabel: {
    fontSize: 13,
    ...fontStyles.bold,
  },
  scoreText: {
    fontSize: 28,
    ...fontStyles.extraBold,
    letterSpacing: 0,
    lineHeight: 72,
    marginBottom: 28,
  },
  ratingText: {
    fontSize: 18,
    ...fontStyles.extraBold,
  },
  summaryColumn: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  metric: {
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 12,
    ...fontStyles.bold,
  },
  metricValue: {
    fontSize: 18,
    ...fontStyles.extraBold,
    marginTop: 2,
  },
});
