import { nairobiRoutes } from "../data/nairobiRoutes";

export function getRouteSelection(fromStop, toStop) {
  if (!fromStop || !toStop || fromStop.id === toStop.id) return null;

  const sharedRoute = nairobiRoutes.find(
    (route) =>
      route.stops.some((s) => s.id === fromStop.id) &&
      route.stops.some((s) => s.id === toStop.id)
  );

  if (sharedRoute) {
    const stops = sharedRoute.stops;
    const fromIndex = stops.findIndex((s) => s.id === fromStop.id);
    const toIndex = stops.findIndex((s) => s.id === toStop.id);
    const [start, end] =
      fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    const segment = stops.slice(start, end + 1);

    return {
      route: sharedRoute,
      waypoints: segment.map((s) => s.position),
      highlightedStopIds: segment.map((s) => s.id),
    };
  }

  // Different highways — no shared stops to route through, just a direct line
  return {
    route: null,
    waypoints: [fromStop.position, toStop.position],
    highlightedStopIds: [fromStop.id, toStop.id],
  };
}