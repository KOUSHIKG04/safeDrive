import { useDriveSessionContext } from "@/features/driveAnalysis/DriveSessionContext";
import { SensorStatusPanel } from "@/features/driveAnalysis/components/sensors/SensorStatusPanel";
import { SensorVisualizations } from "@/features/driveAnalysis/components/sensors/SensorVisualizations";
import { AppScreen } from "@/shared/components/AppScreen";

export default function SensorsScreen() {
  const { latestReadings, telemetry, availability, status } =
    useDriveSessionContext();

  return (
    <AppScreen eyebrow="Live Sensors" title="Motion Data Stream" contentGap={14}>
      <SensorStatusPanel status={status} />
      <SensorVisualizations
        latestReadings={latestReadings}
        telemetry={telemetry}
        availability={availability}
      />
    </AppScreen>
  );
}
