import type { RoutePoint } from "../../types";

export type ProjectedPoint = {
  x: number;
  y: number;
};

export function projectRoutePoints(
  route: RoutePoint[],
  width: number,
  height: number,
): ProjectedPoint[] {
  if (route.length === 0) {
    return [];
  }

  const latitudes = route.map((point) => point.latitude);
  const longitudes = route.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeRange = Math.max(maxLatitude - minLatitude, 0.0001);
  const longitudeRange = Math.max(maxLongitude - minLongitude, 0.0001);
  const padding = 18;
  const drawableWidth = width - padding * 2;
  const drawableHeight = height - padding * 2;

  return route.map((point) => ({
    x:
      padding +
      ((point.longitude - minLongitude) / longitudeRange) * drawableWidth,
    y:
      padding +
      (1 - (point.latitude - minLatitude) / latitudeRange) * drawableHeight,
  }));
}

export function toPolylinePoints(points: ProjectedPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}
