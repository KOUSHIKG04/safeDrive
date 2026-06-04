import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { fontStyles } from "@/fontDefaults";
import { useAppTheme } from "@/theme";
import type { DriveEvent, RoutePoint } from "../../types";
import { EVENT_CHART_COLORS } from "./eventChartColors";
import { projectRoutePoints, toPolylinePoints } from "./routeGeometry";

type EventHeatmapCardProps = {
  route: RoutePoint[];
  events: DriveEvent[];
};

export function EventHeatmapCard({ route, events }: EventHeatmapCardProps) {
  const { colors } = useAppTheme();
  const width = 300;
  const height = 170;
  const eventsWithLocation = events.filter((event) => event.location);
  const eventLocations = eventsWithLocation.map(
    (event) => event.location as RoutePoint,
  );
  const projectedPoints = projectRoutePoints(
    [...route, ...eventLocations],
    width,
    height,
  );
  const projectedRoute = projectedPoints.slice(0, route.length);
  const eventPoints = eventsWithLocation
    .filter((event) => event.location)
    .map((event, index) => ({
      event,
      point: projectedPoints[route.length + index],
    }))
    .filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.cardForeground }]}>
        Event Heatmap
      </Text>
      <View style={[styles.mapCanvas, { backgroundColor: colors.muted }]}>
        {route.length < 2 || eventPoints.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Event heatmap appears after GPS points and driving events are captured
          </Text>
        ) : (
          <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            <Polyline
              points={toPolylinePoints(projectedRoute)}
              fill="none"
              stroke={colors.border}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
            />
            {eventPoints.map((item) =>
              item ? (
                <Circle
                  key={item.event.id}
                  cx={item.point.x}
                  cy={item.point.y}
                  r={Math.min(14, 7 + item.event.intensity * 3)}
                  fill={EVENT_CHART_COLORS[item.event.type]}
                  opacity={0.78}
                />
              ) : null,
            )}
          </Svg>
        )}
      </View>
      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
        {eventPoints.length} events mapped to route
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
