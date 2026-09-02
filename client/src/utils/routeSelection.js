import { nairobiRoutes, allStops } from "../data/nairobiRoutes";

export function isValidPosition(position) {
  return (
    Array.isArray(position) &&
    position.length === 2 &&
    position.every((coordinate) =>
      typeof coordinate === "number" && Number.isFinite(coordinate)
    )
  );
}

export function getRouteSelection(fromStop, toStop) {
  if (!fromStop || !toStop || fromStop.id === toStop.id) return null;

  const sharedRoute = nairobiRoutes.find(
    (route) =>
      route.stops.some((stop) => stop.id === fromStop.id) &&
      route.stops.some((stop) => stop.id === toStop.id)
  );

  if (sharedRoute) {
    const stops = sharedRoute.stops;
    const fromIndex = stops.findIndex((stop) => stop.id === fromStop.id);
    const toIndex = stops.findIndex((stop) => stop.id === toStop.id);
    const [start, end] =
      fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
    const segment = stops.slice(start, end + 1);
    const enrichedStops = segment.map((stop) => ({
      ...stop,
      routeId: sharedRoute.id,
      routeName: sharedRoute.name,
    }));

    return {
      route: sharedRoute,
      stops: enrichedStops,
      waypoints: segment.map((stop) => stop.position).filter(isValidPosition),
      highlightedStopIds: segment.map((stop) => stop.id),
    };
  }

  return {
    route: null,
    stops: [fromStop, toStop],
    waypoints: [fromStop.position, toStop.position].filter(isValidPosition),
    highlightedStopIds: [fromStop.id, toStop.id],
  };
}

export function getVisibleStops(selection) {
  if (selection && selection.stops) return selection.stops;
  return allStops;
}
