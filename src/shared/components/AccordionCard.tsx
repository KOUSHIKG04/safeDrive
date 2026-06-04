import Ionicons from "@expo/vector-icons/Ionicons";
import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";

type AccordionCardProps = PropsWithChildren<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  backgroundColor?: string;
  borderColor?: string;
}>;

export function AccordionCard({
  children,
  title,
  isOpen,
  onToggle,
  backgroundColor,
  borderColor,
}: AccordionCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
      style={[
        styles.card,
        {
          backgroundColor: backgroundColor ?? colors.card,
          borderColor: borderColor ?? colors.border,
        },
      ]}
      onPress={onToggle}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={22}
          color={colors.mutedForeground}
        />
      </View>
      {isOpen ? <View style={styles.body}>{children}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: 20,
    ...fontStyles.extraBold,
    textAlign: "left",
  },
  body: {
    marginTop: 12,
  },
});
