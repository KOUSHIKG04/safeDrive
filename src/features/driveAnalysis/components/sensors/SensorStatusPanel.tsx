import { StyleSheet, Text, View } from "react-native";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import type { DriveStatus } from "../../types";

type SensorStatusPanelProps = {
  status: DriveStatus;
};

export function SensorStatusPanel({ status }: SensorStatusPanelProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.statusPanel, { backgroundColor: colors.background }]}>
      <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>
        Collection Status
      </Text>
      <Text style={[styles.statusValue, { color: colors.cardForeground }]}>
        {status === "driving"
          ? "Streaming sensor readings"
          : "Start a drive to collect live data"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusPanel: {
    borderRadius: 8,
    gap: 4,
    padding: 14,
  },
  statusLabel: {
    fontSize: 12,
    ...fontStyles.extraBold,
    textAlign: "center",
    textTransform: "uppercase",
  },
  statusValue: {
    fontSize: 16,
    ...fontStyles.extraBold,
    textAlign: "center",
  },
});
