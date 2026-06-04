import { Tabs } from "expo-router";
import { DriveSessionProvider } from "@/features/driveAnalysis/DriveSessionContext";
import {
  FloatingTabBar,
  useFloatingTabBarOffset,
} from "@/shared/navigation/FloatingTabBar";
import { useAppTheme } from "@/theme";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const tabBarOffset = useFloatingTabBarOffset();

  return (
    <DriveSessionProvider>
      <Tabs
        screenOptions={{
          sceneStyle: {
            backgroundColor: colors.background,
            paddingBottom: tabBarOffset,
          },
          headerShown: false,
          tabBarStyle: {
            display: "none",
          },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="sensors" />
        <Tabs.Screen name="analytics" />
        <Tabs.Screen name="thresholds" />
      </Tabs>

      <FloatingTabBar />
    </DriveSessionProvider>
  );
}
