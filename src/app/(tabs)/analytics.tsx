import { useState } from "react";
import { useDriveSessionContext } from "@/features/driveAnalysis/DriveSessionContext";
import { EventBreakdownChart } from "@/features/driveAnalysis/components/analytics/EventBreakdownChart";
import { EventHeatmapCard } from "@/features/driveAnalysis/components/analytics/EventHeatmapCard";
import { HistoricalComparisonCard } from "@/features/driveAnalysis/components/analytics/HistoricalComparisonCard";
import { LatestEventsAccordion } from "@/features/driveAnalysis/components/analytics/LatestEventsAccordion";
import { RouteReplayCard } from "@/features/driveAnalysis/components/analytics/RouteReplayCard";
import { SessionSummaryAccordion } from "@/features/driveAnalysis/components/analytics/SessionSummaryAccordion";
import { useAiDrivingFeedback } from "@/features/driveAnalysis/hooks/useAiDrivingFeedback";
import { AppScreen } from "@/shared/components/AppScreen";

export default function AnalyticsScreen() {
  const {
    status,
    elapsedMs,
    events,
    breakdown,
    score,
    rating,
    route,
    driveHistory,
  } = useDriveSessionContext();
  const [isLatestEventsOpen, setIsLatestEventsOpen] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const { feedback, isGenerating } = useAiDrivingFeedback({
    status,
    elapsedMs,
    events,
    breakdown,
    score,
    rating,
  });

  return (
    <AppScreen eyebrow="Analytics" title="Drive Session Summary">
      <EventBreakdownChart breakdown={breakdown} total={events.length} />
      <RouteReplayCard route={route} />
      <EventHeatmapCard route={route} events={events} />
      <LatestEventsAccordion
        events={events}
        isOpen={isLatestEventsOpen}
        onToggle={() => {
          setIsLatestEventsOpen((current) => !current);
        }}
      />
      <SessionSummaryAccordion
        elapsedMs={elapsedMs}
        eventCount={events.length}
        score={score}
        rating={rating}
        feedback={feedback}
        isGenerating={isGenerating}
        isOpen={isSummaryOpen}
        onToggle={() => {
          setIsSummaryOpen((current) => !current);
        }}
      />
      <HistoricalComparisonCard
        currentScore={score}
        currentEventCount={events.length}
        history={driveHistory}
      />
    </AppScreen>
  );
}
