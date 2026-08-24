import { nairobiRoutes, allStops } from "../data/nairobiRoutes";

/**
 * Given an origin and destination stop, finds the shared route (if any)
 * and returns the ordered segment of stops between them (inclusive),
 * the waypoints for the routing line, and the highlighted stop ids.
 *
 * Each stop in the returned `stops` array carries routeId / routeName metadata.
 */
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

    // Enrich each segment stop with route metadata
    const enrichedStops = segment.map((s) => ({
      ...s,
      routeId: sharedRoute.id,
      routeName: sharedRoute.name,
    }));

    return {
      route: sharedRoute,
      stops: enrichedStops,
      waypoints: segment.map((s) => s.position),
      highlightedStopIds: segment.map((s) => s.id),
    };
  }

  // Different routes — no shared segment, just origin and destination
  return {
    route: null,
    stops: [fromStop, toStop],
    waypoints: [fromStop.position, toStop.position],
    highlightedStopIds: [fromStop.id, toStop.id],
  };
}

/**
 * Resolves which stops should be visible on the map.
 * - When a route selection exists, only the segment stops are shown.
 * - Otherwise all stops are shown for interactive picking.
 */
export function getVisibleStops(selection) {
  if (selection && selection.stops) {
    return selection.stops;
  }
  return allStops;
}