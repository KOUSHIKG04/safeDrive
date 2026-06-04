import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";

type AppScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  contentGap?: number;
}>;

export function AppScreen({
  children,
  eyebrow,
  title,
  contentGap = 18,
}: AppScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const contentWidth = Math.min(Math.max(width - 36, 300), 980);

  return (
    <View
      style={[
        styles.safeArea,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: contentGap, width: contentWidth, alignSelf: "center" },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.sidebarPrimary }]}>
            {eyebrow}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {title}
          </Text>
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 10,
    paddingBottom: 112,
  },
  header: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 13,
    ...fontStyles.extraBold,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    ...fontStyles.extraBold,
    letterSpacing: 0,
    lineHeight: 35,
  },
});
