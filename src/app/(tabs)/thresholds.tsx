import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  DETECTION_THRESHOLDS,
  EVENT_COOLDOWN_MS,
  EVENT_LABELS,
  SCORE_PENALTIES,
  SENSOR_UPDATE_INTERVAL_MS,
  UI_UPDATE_INTERVAL_MS,
} from "@/features/driveAnalysis/thresholds";
import type { DriveEventType } from "@/features/driveAnalysis/types";
import { fontStyles } from "@/fontDefaults";
import { AppScreen } from "@/shared/components/AppScreen";
import { useAppTheme } from "@/theme";

const EVENT_ORDER: DriveEventType[] = [
  "phoneHandling",
  "harshBraking",
  "harshAcceleration",
  "sharpTurn",
  "aggressiveSteering",
  "excessiveMovement",
];

const THRESHOLD_TEXT: Record<DriveEventType, string> = {
  harshBraking: `${DETECTION_THRESHOLDS.harshBrakeForwardG} g forward`,
  harshAcceleration: `${DETECTION_THRESHOLDS.harshAccelerationForwardG} g forward`,
  sharpTurn: `${DETECTION_THRESHOLDS.sharpTurnLateralG} g lateral`,
  aggressiveSteering: `${DETECTION_THRESHOLDS.aggressiveSteeringZRadPerSecond} rad/s yaw`,
  excessiveMovement: `${DETECTION_THRESHOLDS.excessiveMovementRawG} g raw`,
  phoneHandling: `${DETECTION_THRESHOLDS.phoneHandlingGyroRadPerSecond} rad/s rotation`,
};

const RULE_DESCRIPTIONS: Record<DriveEventType, string> = {
  harshBraking: "Forward-axis deceleration below the braking limit.",
  harshAcceleration: "Forward-axis acceleration above the launch limit.",
  sharpTurn: `Also triggers on ${DETECTION_THRESHOLDS.sharpTurnHeadingChangeDegrees} deg heading change.`,
  aggressiveSteering: "Fast yaw rotation from abrupt steering movement.",
  excessiveMovement: `Also triggers on ${DETECTION_THRESHOLDS.excessiveMovementLinearG} g linear motion.`,
  phoneHandling: `Requires ${DETECTION_THRESHOLDS.phoneHandlingLinearG} g movement plus rotation.`,
};

export default function ThresholdsScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const isWide = width >= 760;
  const [openRule, setOpenRule] = useState<DriveEventType | null>("phoneHandling");

  return (
    <AppScreen eyebrow="Detection Rules" title="Thresholds And Penalties">
      <View style={styles.ruleList}>
        {EVENT_ORDER.map((type, index) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            accessibilityState={{ expanded: openRule === type }}
            style={[
              styles.ruleCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              setOpenRule((current) => (current === type ? null : type));
            }}
          >
            <View style={styles.ruleHeader}>
              <View
                style={[
                  styles.ruleIndex,
                  { backgroundColor: colors.tagBackground },
                ]}
              >
                <Text style={[styles.ruleIndexText, { color: colors.tagForeground }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.ruleTitle, { color: colors.cardForeground }]}>
                {EVENT_LABELS[type]}
              </Text>
              <View
                style={[styles.penaltyBadge, { backgroundColor: colors.muted }]}
              >
                <Text
                  style={[
                    styles.penaltyBadgeText,
                    { color: colors.destructive },
                  ]}
                >
                  -{SCORE_PENALTIES[type]}
                </Text>
              </View>
              <Ionicons
                name={openRule === type ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.mutedForeground}
              />
            </View>
            {openRule === type ? (
              <View style={styles.ruleBody}>
                <Text
                  style={[
                    styles.ruleDescription,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {RULE_DESCRIPTIONS[type]}
                </Text>
                <View style={styles.ruleMetrics}>
                  <RuleMetric
                    label="Threshold"
                    value={THRESHOLD_TEXT[type]}
                    colors={colors}
                  />
                  <RuleMetric
                    label="Penalty"
                    value={`-${SCORE_PENALTIES[type]}`}
                    colors={colors}
                    danger
                  />
                  <RuleMetric
                    label="Cooldown"
                    value={`${EVENT_COOLDOWN_MS[type]} ms`}
                    colors={colors}
                  />
                </View>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      <View style={[styles.frequencyGrid, isWide && styles.frequencyGridWide]}>
        <FrequencyCard
          label="Sensor Frequency"
          value={`${1000 / SENSOR_UPDATE_INTERVAL_MS} Hz`}
          detail={`${SENSOR_UPDATE_INTERVAL_MS} ms sampling interval`}
          colors={colors}
        />
        <FrequencyCard
          label="UI Refresh"
          value={`${UI_UPDATE_INTERVAL_MS} ms`}
          detail="Throttled to reduce re-renders"
          colors={colors}
        />
      </View>
    </AppScreen>
  );
}

function FrequencyCard({
  label,
  value,
  detail,
  colors,
}: {
  label: string;
  value: string;
  detail: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View style={[styles.frequencyCard, { backgroundColor: colors.code }]}>
      <Text style={[styles.frequencyLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.frequencyValue, { color: colors.codeForeground }]}>
        {value}
      </Text>
      <Text style={[styles.frequencyDetail, { color: colors.mutedForeground }]}>
        {detail}
      </Text>
    </View>
  );
}

function RuleMetric({
  label,
  value,
  colors,
  danger,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
  danger?: boolean;
}) {
  return (
    <View style={[styles.ruleMetric, { backgroundColor: colors.muted }]}>
      <Text style={[styles.ruleMetricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.ruleMetricValue,
          { color: danger ? colors.destructive : colors.foreground },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frequencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  frequencyGridWide: {
    flexWrap: "nowrap",
  },
  frequencyCard: {
    backgroundColor: "#101818",
    borderRadius: 8,
    flex: 1,
    minWidth: 150,
    padding: 16,
  },
  frequencyLabel: {
    color: "#AFC0C0",
    fontSize: 12,
    ...fontStyles.extraBold,
    textTransform: "uppercase",
  },
  frequencyValue: {
    color: "#FFFFFF",
    fontSize: 30,
    ...fontStyles.extraBold,
    marginTop: 6,
  },
  frequencyDetail: {
    color: "#C8D6D6",
    fontSize: 13,
    ...fontStyles.bold,
    lineHeight: 18,
    marginTop: 4,
  },
  ruleList: {
    gap: 12,
  },
  ruleCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE6E8",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  ruleHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  ruleIndex: {
    alignItems: "center",
    backgroundColor: "#EAF8F3",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  ruleIndexText: {
    color: "#147443",
    fontSize: 14,
    ...fontStyles.extraBold,
  },
  ruleTitle: {
    color: "#172324",
    flex: 1,
    fontSize: 16,
    ...fontStyles.extraBold,
  },
  penaltyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  penaltyBadgeText: {
    fontSize: 12,
    ...fontStyles.extraBold,
  },
  ruleBody: {
    gap: 12,
    paddingTop: 2,
  },
  ruleDescription: {
    color: "#516165",
    fontSize: 14,
    ...fontStyles.bold,
    lineHeight: 20,
  },
  ruleMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ruleMetric: {
    backgroundColor: "#F2F6F7",
    borderRadius: 8,
    flex: 1,
    minWidth: 94,
    padding: 10,
  },
  ruleMetricLabel: {
    color: "#657276",
    fontSize: 11,
    ...fontStyles.extraBold,
    textTransform: "uppercase",
  },
  ruleMetricValue: {
    color: "#182526",
    fontSize: 12,
    ...fontStyles.extraBold,
    lineHeight: 17,
    marginTop: 4,
  },
});
