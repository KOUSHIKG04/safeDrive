import { StyleSheet, Text, View } from "react-native";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import { formatDuration } from "@/shared/utils/time";
import type { DriveEvent } from "../../types";

type EventTimelineProps = {
  events: DriveEvent[];
};

export function EventTimeline({ events }: EventTimelineProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Event Timeline
        </Text>
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
          Latest first
        </Text>
      </View>
      {events.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No events detected
          </Text>
        </View>
      ) : (
        events.slice(0, 12).map((event) => (
          <View
            key={event.id}
            style={[
              styles.timelineItem,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.timelineDot, { backgroundColor: colors.chart3 }]}
            />
            <View style={styles.timelineBody}>
              <Text
                style={[
                  styles.timelineTitle,
                  { color: colors.cardForeground },
                ]}
                numberOfLines={2}
              >
                {event.label}
              </Text>
              <Text
                style={[
                  styles.timelineDetail,
                  { color: colors.mutedForeground },
                ]}
                numberOfLines={3}
              >
                {formatDuration(event.elapsedMs)} - -{event.penalty} -{" "}
                {event.detail}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 20,
    ...fontStyles.extraBold,
  },
  sectionMeta: {
    fontSize: 13,
    ...fontStyles.bold,
  },
  emptyState: {
    alignItems: "center",
    borderRadius: 8,
    padding: 18,
  },
  emptyText: {
    fontSize: 14,
    ...fontStyles.bold,
    textDecorationLine: "underline",
  },
  timelineItem: {
    alignItems: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  timelineDot: {
    borderRadius: 5,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  timelineBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  timelineTitle: {
    flexShrink: 1,
    fontSize: 15,
    ...fontStyles.extraBold,
    minWidth: 0,
  },
  timelineDetail: {
    flexShrink: 1,
    fontSize: 13,
    ...fontStyles.semiBold,
    lineHeight: 18,
    maxWidth: "100%",
  },
});
