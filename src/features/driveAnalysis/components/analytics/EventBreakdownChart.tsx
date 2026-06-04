import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import type { EventBreakdown } from "../../types";
import { EVENT_CHART_COLORS, EVENT_ORDER } from "./eventChartColors";

type EventBreakdownChartProps = {
  breakdown: EventBreakdown;
  total: number;
};

export function EventBreakdownChart({
  breakdown,
  total,
}: EventBreakdownChartProps) {
  const { colors } = useAppTheme();
  const size = 190;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Event Breakdown
      </Text>
      <View style={styles.chartWrap}>
        <View style={styles.chartBox}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.muted}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {total > 0
              ? EVENT_ORDER.map((type) => {
                  const count = breakdown[type];
                  const segment = count / total;
                  const dashLength = segment * circumference;
                  const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
                  const strokeDashoffset = -offset;

                  offset += dashLength;

                  if (count === 0) {
                    return null;
                  }

                  return (
                    <Circle
                      key={type}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={EVENT_CHART_COLORS[type]}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                      rotation="-90"
                      originX={size / 2}
                      originY={size / 2}
                    />
                  );
                })
              : null}
          </Svg>
          <View style={styles.chartCenter}>
            <Text style={[styles.chartTotal, { color: colors.cardForeground }]}>
              {total}
            </Text>
            <Text
              style={[styles.chartTotalLabel, { color: colors.mutedForeground }]}
            >
              events
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    ...fontStyles.extraBold,
    marginBottom: 6,
    textAlign: "left",
  },
  chartWrap: {
    alignItems: "center",
  },
  chartBox: {
    alignItems: "center",
    height: 250,
    justifyContent: "center",
    width: 190,
  },
  chartCenter: {
    alignItems: "center",
    position: "absolute",
  },
  chartTotal: {
    fontSize: 34,
    ...fontStyles.extraBold,
    lineHeight: 38,
  },
  chartTotalLabel: {
    fontSize: 12,
    ...fontStyles.extraBold,
    textTransform: "uppercase",
  },
});
