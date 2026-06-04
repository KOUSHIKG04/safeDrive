import Ionicons from "@expo/vector-icons/Ionicons";
import { usePathname, useRouter, type Href } from "expo-router";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/theme";

type TabItem = {
  name: "index" | "sensors" | "analytics" | "thresholds";
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

const tabs: TabItem[] = [
  { name: "index", icon: "car-sport-outline", route: "/" },
  { name: "sensors", icon: "radio-outline", route: "/sensors" },
  { name: "analytics", icon: "bar-chart-outline", route: "/analytics" },
  { name: "thresholds", icon: "speedometer-outline", route: "/thresholds" },
];

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleColorScheme } = useAppTheme();
  const tabBarWidth = Math.min(width * 0.72, width - 106, 420);
  const tabBarBottom = Math.max(insets.bottom + 12, 18);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: tabBarBottom }]}
    >
      <View style={styles.navRow}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.sidebar,
              borderColor: colors.sidebarBorder,
              shadowOpacity: isDark ? 0.28 : 0.14,
              width: tabBarWidth,
            },
          ]}
        >
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.route ||
              (tab.route === "/" && pathname === "/index");

            return (
              <Pressable
                key={tab.name}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.item,
                  isActive && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  router.push(tab.route);
                }}
              >
                <Ionicons
                  name={tab.icon}
                  size={26}
                  color={
                    isActive
                      ? isDark
                        ? colors.primaryForeground
                        : colors.foreground
                      : colors.mutedForeground
                  }
                />
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityLabel="Toggle theme"
          accessibilityRole="button"
          style={[
            styles.themeButton,
            {
              backgroundColor: colors.sidebar,
              borderColor: colors.sidebarBorder,
              shadowOpacity: isDark ? 0.28 : 0.14,
            },
          ]}
          onPress={toggleColorScheme}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={22}
            color={colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

export function useFloatingTabBarOffset() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(insets.bottom + 12, 18);

  return tabBarBottom + 72;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  container: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    elevation: 8,
    flexDirection: "row",
    height: 66,
    paddingHorizontal: 8,
    shadowColor: "#101818",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 18,
  },
  item: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 3,
    minHeight: 44,
    paddingHorizontal: 4,
  },
  themeButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    elevation: 8,
    height: 68,
    justifyContent: "center",
    shadowColor: "#101818",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 18,
    width: 56,
  },
});
