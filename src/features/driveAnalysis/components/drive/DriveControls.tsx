import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import type { DriveStatus } from "../../types";

type DriveControlsProps = {
  status: DriveStatus;
  compact: boolean;
  onStart: () => void;
  onEnd: () => void;
  onReset: () => void;
};

export function DriveControls({
  status,
  compact,
  onStart,
  onEnd,
  onReset,
}: DriveControlsProps) {
  const { colors } = useAppTheme();
  const isDriving = status === "driving";

  return (
    <View style={[styles.actions, compact && styles.actionsCompact]}>
      <Pressable
        style={[
          isDriving ? styles.dangerButton : styles.primaryButton,
          {
            backgroundColor: isDriving ? colors.destructive : colors.primary,
          },
        ]}
        onPress={isDriving ? onEnd : onStart}
      >
        <View style={styles.buttonContent}>
          <Ionicons
            name={isDriving ? "stop-circle-outline" : "play-circle-outline"}
            size={20}
            color={
              isDriving
                ? colors.destructiveForeground
                : colors.primaryForeground
            }
          />
          <Text
            style={[
              isDriving ? styles.dangerButtonText : styles.primaryButtonText,
              {
                color: isDriving
                  ? colors.destructiveForeground
                  : colors.primaryForeground,
              },
            ]}
          >
            {isDriving ? "End Drive" : "Start Drive"}
          </Text>
        </View>
      </Pressable>
      <Pressable
        style={[
          styles.secondaryButton,
          { backgroundColor: colors.secondary, borderColor: colors.border },
        ]}
        onPress={onReset}
      >
        <View style={styles.buttonContent}>
          <Ionicons
            name="refresh-outline"
            size={19}
            color={colors.secondaryForeground}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: colors.secondaryForeground },
            ]}
          >
            Reset
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  actionsCompact: {
    flexDirection: "column",
  },
  buttonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 15,
  },
  primaryButtonText: {
    fontSize: 16,
    ...fontStyles.extraBold,
  },
  dangerButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 15,
  },
  dangerButtonText: {
    fontSize: 16,
    ...fontStyles.extraBold,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  secondaryButtonText: {
    fontSize: 16,
    ...fontStyles.extraBold,
  },
});
