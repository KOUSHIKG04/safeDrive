import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import type { RoutePoint } from "../../types";
import { projectRoutePoints, toPolylinePoints } from "./routeGeometry";

type RouteReplayCardProps = {
  route: RoutePoint[];
};

export function RouteReplayCard({ route }: RouteReplayCardProps) {
  const { colors } = useAppTheme();
  const width = 300;
  const height = 170;
  const projectedRoute = projectRoutePoints(route, width, height);
  const startPoint = projectedRoute[0];
  const endPoint = projectedRoute[projectedRoute.length - 1];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.cardForeground }]}>
        Route Replay
      </Text>
      <View style={[styles.mapCanvas, { backgroundColor: colors.muted }]}>
        {projectedRoute.length < 2 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Start a drive with location permission to record a route
          </Text>
        ) : (
          <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            <Polyline
              points={toPolylinePoints(projectedRoute)}
              fill="none"
              stroke={colors.primary}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
            />
            {startPoint ? (
              <Circle
                cx={startPoint.x}
                cy={startPoint.y}
                r={6}
                fill={colors.syntaxString}
              />
            ) : null}
            {endPoint ? (
              <Circle
                cx={endPoint.x}
                cy={endPoint.y}
                r={6}
                fill={colors.destructive}
              />
            ) : null}
          </Svg>
        )}
      </View>
      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
        {route.length} route points captured
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  title: {
    fontSize: 20,
    ...fontStyles.extraBold,
  },
  mapCanvas: {
    alignItems: "center",
    borderRadius: 8,
    height: 170,
    justifyContent: "center",
    overflow: "hidden",
  },
  emptyText: {
    fontSize: 13,
    ...fontStyles.bold,
    lineHeight: 18,
    paddingHorizontal: 18,
    textAlign: "center",
  },
  metaText: {
    fontSize: 12,
    ...fontStyles.bold,
  },
});
