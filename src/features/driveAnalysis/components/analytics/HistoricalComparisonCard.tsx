import { StyleSheet, Text, View } from "react-native";
import { fontStyles } from "@/fontDefaults";
import { formatDuration } from "@/shared/utils/time";
import { useAppTheme } from "@/theme";
import type { DriveSummary } from "../../types";

type HistoricalComparisonCardProps = {
  currentScore: number;
  currentEventCount: number;
  history: DriveSummary[];
};

export function HistoricalComparisonCard({
  currentScore,
  currentEventCount,
  history,
}: HistoricalComparisonCardProps) {
  const { colors } = useAppTheme();
  const previousDrives = history.slice(1, 6);
  const averageScore =
    previousDrives.length > 0
      ? Math.round(
          previousDrives.reduce((sum, drive) => sum + drive.score, 0) /
            previousDrives.length,
        )
      : null;
  const scoreDelta =
    averageScore === null ? null : currentScore - averageScore;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.cardForeground }]}>
        Historical Comparison
      </Text>
      <View style={styles.metricRow}>
        <ComparisonMetric
          label="Current Score"
          value={String(currentScore)}
        />
        <ComparisonMetric
          label="Recent Avg"
          value={averageScore === null ? "--" : String(averageScore)}
        />
        <ComparisonMetric
          label="Score Change"
          value={scoreDelta === null ? "--" : `${scoreDelta >= 0 ? "+" : ""}${scoreDelta}`}
        />
      </View>
      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
        {previousDrives.length === 0
          ? "Complete at least two drives to compare sessions."
          : `Compared with ${previousDrives.length} recent drive${previousDrives.length === 1 ? "" : "s"}. Current events: ${currentEventCount}.`}
      </Text>
      {history.slice(0, 3).map((drive) => (
        <View
          key={drive.id}
          style={[styles.historyRow, { backgroundColor: colors.muted }]}
        >
          <Text style={[styles.historyScore, { color: colors.foreground }]}>
            {drive.score}
          </Text>
          <Text style={[styles.historyDetail, { color: colors.mutedForeground }]}>
            {drive.rating} - {drive.totalEvents} events -{" "}
            {formatDuration(drive.durationMs)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ComparisonMetric({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.metric, { backgroundColor: colors.background }]}>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  title: {
    fontSize: 20,
    ...fontStyles.extraBold,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
  },
  metric: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 10,
    ...fontStyles.extraBold,
    textAlign: "center",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 18,
    ...fontStyles.extraBold,
  },
  metaText: {
    fontSize: 12,
    ...fontStyles.bold,
    lineHeight: 18,
  },
  historyRow: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },
  historyScore: {
    fontSize: 18,
    ...fontStyles.extraBold,
    width: 36,
  },
  historyDetail: {
    flex: 1,
    fontSize: 12,
    ...fontStyles.bold,
  },
});
