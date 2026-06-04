import { Text, useWindowDimensions } from "react-native";
import { useDriveSessionContext } from "@/features/driveAnalysis/DriveSessionContext";
import { DriveControls } from "@/features/driveAnalysis/components/drive/DriveControls";
import { DriveScorePanel } from "@/features/driveAnalysis/components/drive/DriveScorePanel";
import { EventTimeline } from "@/features/driveAnalysis/components/drive/EventTimeline";
import { fontStyles } from "@/fontDefaults";
import { AppScreen } from "@/shared/components/AppScreen";
import { useAppTheme } from "@/theme";

export default function Index() {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const {
    status,
    elapsedMs,
    events,
    availability,
    score,
    rating,
    error,
    startDrive,
    endDrive,
    resetDrive,
  } = useDriveSessionContext();

  return (
    <AppScreen
      eyebrow="SafeDrive"
      title="Driving Safety Analyzer"
      contentGap={10}
    >
      <DriveScorePanel
        elapsedMs={elapsedMs}
        eventCount={events.length}
        score={score}
        rating={rating}
        availability={availability}
        isWide={width >= 760}
      />
      <DriveControls
        status={status}
        compact={width < 380}
        onStart={startDrive}
        onEnd={endDrive}
        onReset={resetDrive}
      />
      {error ? (
        <Text
          style={[
            {
              backgroundColor: colors.tagBackground,
              borderRadius: 8,
              color: colors.destructive,
              fontSize: 14,
              padding: 12,
            },
            fontStyles.bold,
          ]}
        >
          {error}
        </Text>
      ) : null}
      <EventTimeline events={events} />
    </AppScreen>
  );
}
