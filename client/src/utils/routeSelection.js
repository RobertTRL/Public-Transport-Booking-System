import { nairobiRoutes, allStops } from "../data/nairobiRoutes";

export function isValidPosition(position) {
  return (
    Array.isArray(position) &&
    position.length === 2 &&
    position.every(
      (coordinate) =>
        typeof coordinate === "number" && Number.isFinite(coordinate)
    )
  );
}

function buildSelection(stops, fromStop, toStop, route) {
  const fromIndex = stops.findIndex(
    (stop) => String(stop.id) === String(fromStop.id)
  );
  const toIndex = stops.findIndex(
    (stop) => String(stop.id) === String(toStop.id)
  );

  if (fromIndex === -1 || toIndex === -1) return null;

  const [start, end] =
    fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
  const segment = stops.slice(start, end + 1);

  return {
    route: route || null,
    stops: segment.map((stop) => ({
      ...stop,
      routeId: stop.routeId ?? route?.id,
      routeName: stop.routeName ?? route?.name,
    })),
    waypoints: segment.map((stop) => stop.position).filter(isValidPosition),
    highlightedStopIds: segment.map((stop) => stop.id),
  };
}

// routeStops and selectedRoute make this work with the real API, whose
// route-stop ids are numeric and do not exist in the local demo data.
export function getRouteSelection(
  fromStop,
  toStop,
  routeStops = [],
  selectedRoute = null
) {
  if (!fromStop || !toStop || String(fromStop.id) === String(toStop.id)) {
    return null;
  }

  const apiSelection = buildSelection(
    routeStops,
    fromStop,
    toStop,
    selectedRoute
  );
  if (apiSelection) return apiSelection;

  const sharedRoute = nairobiRoutes.find(
    (route) =>
      route.stops.some((stop) => String(stop.id) === String(fromStop.id)) &&
      route.stops.some((stop) => String(stop.id) === String(toStop.id))
  );

  if (sharedRoute) {
    return buildSelection(sharedRoute.stops, fromStop, toStop, sharedRoute);
  }

  return {
    route: selectedRoute,
    stops: [fromStop, toStop],
    waypoints: [fromStop.position, toStop.position].filter(isValidPosition),
    highlightedStopIds: [fromStop.id, toStop.id],
  };
}

export function getVisibleStops(selection) {
  if (selection?.stops) return selection.stops;
  return allStops;
}
