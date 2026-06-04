import { StyleSheet, Text, View } from "react-native";
import { AccordionCard } from "@/shared/components/AccordionCard";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import type { DriveEvent } from "../../types";
import { EVENT_CHART_COLORS } from "./eventChartColors";

type LatestEventsAccordionProps = {
  events: DriveEvent[];
  isOpen: boolean;
  onToggle: () => void;
};

export function LatestEventsAccordion({
  events,
  isOpen,
  onToggle,
}: LatestEventsAccordionProps) {
  const { colors } = useAppTheme();

  return (
    <AccordionCard
      title="Latest Events"
      isOpen={isOpen}
      onToggle={onToggle}
      backgroundColor={colors.background}
      borderColor={colors.border}
    >
      <View style={styles.body}>
        {events.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No events detected yet
            </Text>
          </View>
        ) : (
          events.slice(0, 8).map((event) => (
            <View
              key={event.id}
              style={[
                styles.eventRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.eventColorBar,
                  { backgroundColor: EVENT_CHART_COLORS[event.type] },
                ]}
              />
              <View style={styles.eventContent}>
                <View style={styles.eventTitleRow}>
                  <View
                    style={[
                      styles.eventColorDot,
                      { backgroundColor: EVENT_CHART_COLORS[event.type] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.eventTitle,
                      { color: colors.cardForeground },
                    ]}
                    numberOfLines={2}
                  >
                    {event.label}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.eventDetail,
                    { color: colors.mutedForeground },
                  ]}
                  numberOfLines={2}
                >
                  {event.detail}
                </Text>
              </View>
              <Text style={[styles.eventPenalty, { color: colors.destructive }]}>
                -{event.penalty}
              </Text>
            </View>
          ))
        )}
      </View>
    </AccordionCard>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 10,
  },
  emptyState: {
    alignItems: "flex-start",
    borderRadius: 8,
    padding: 18,
  },
  emptyText: {
    fontSize: 14,
    ...fontStyles.bold,
    textDecorationLine: "underline",
  },
  eventRow: {
    alignItems: "stretch",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
    paddingLeft: 18,
    paddingRight: 50,
    position: "relative",
  },
  eventColorBar: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 5,
  },
  eventContent: {
    minWidth: 0,
    width: "100%",
  },
  eventTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    minWidth: 0,
    width: "100%",
  },
  eventColorDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  eventTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    ...fontStyles.extraBold,
    minWidth: 0,
  },
  eventDetail: {
    flexShrink: 1,
    fontSize: 13,
    ...fontStyles.semiBold,
    lineHeight: 18,
    marginTop: 3,
    maxWidth: "100%",
  },
  eventPenalty: {
    fontSize: 16,
    ...fontStyles.extraBold,
    minWidth: 28,
    position: "absolute",
    right: 14,
    textAlign: "right",
    top: 14,
  },
});
