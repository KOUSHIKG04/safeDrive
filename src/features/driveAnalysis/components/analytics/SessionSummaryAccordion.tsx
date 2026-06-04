import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AccordionCard } from "@/shared/components/AccordionCard";
import { fontStyles } from "@/fontDefaults";
import { formatDuration } from "@/shared/utils/time";
import { useAppTheme } from "@/theme";

type SessionSummaryAccordionProps = {
  elapsedMs: number;
  eventCount: number;
  score: number;
  rating: string;
  feedback: string;
  isGenerating: boolean;
  isOpen: boolean;
  onToggle: () => void;
};

export function SessionSummaryAccordion({
  elapsedMs,
  eventCount,
  score,
  rating,
  feedback,
  isGenerating,
  isOpen,
  onToggle,
}: SessionSummaryAccordionProps) {
  const { colors } = useAppTheme();

  return (
    <AccordionCard
      title="Session Summary"
      isOpen={isOpen}
      onToggle={onToggle}
      backgroundColor={colors.tagBackground}
      borderColor={colors.tagBackground}
    >
      <View style={[styles.summaryGrid, { borderColor: colors.border }]}>
        <View style={styles.summaryStatsRow}>
          <SummaryMetric label="Duration" value={formatDuration(elapsedMs)} />
          <SummaryMetric label="Events" value={String(eventCount)} />
          <SummaryMetric label="Score" value={String(score)} />
        </View>
        <SummaryMetric label="Rating" value={rating} fullWidth />
      </View>

      {isGenerating ? (
        <View style={styles.feedbackLoader}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text
            style={[styles.feedbackLoaderText, { color: colors.tagForeground }]}
          >
            Creating a clear AI driving summary...
          </Text>
        </View>
      ) : (
        <Text
          style={[
            styles.feedbackText,
            { color: colors.tagForeground },
          ]}
        >
          {feedback}
        </Text>
      )}
    </AccordionCard>
  );
}

function SummaryMetric({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.summaryMetric,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        fullWidth && styles.summaryMetricFull,
      ]}
    >
      <Text style={[styles.summaryMetricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.summaryMetricValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    borderTopWidth: 1,
    gap: 10,
    marginBottom: 12,
    paddingTop: 12,
  },
  summaryStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  summaryMetric: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  summaryMetricFull: {
    alignSelf: "stretch",
    paddingVertical: 10,
  },
  summaryMetricLabel: {
    fontSize: 10,
    ...fontStyles.extraBold,
    textAlign: "center",
    textTransform: "uppercase",
  },
  summaryMetricValue: {
    fontSize: 17,
    ...fontStyles.extraBold,
    textAlign: "center",
  },
  feedbackText: {
    fontSize: 15,
    ...fontStyles.bold,
    lineHeight: 21,
    textAlign: "left",
  },
  feedbackLoader: {
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 14,
  },
  feedbackLoaderText: {
    fontSize: 13,
    ...fontStyles.bold,
    lineHeight: 18,
    textAlign: "left",
  },
});
