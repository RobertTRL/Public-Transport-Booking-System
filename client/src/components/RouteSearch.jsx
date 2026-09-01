import RouteDropdown from "./maprelated/RouteDropdown";
import LocationDropdown from "./maprelated/LocationDropdown";
import { allStops, allRoutes } from "../data/nairobiRoutes";

function RouteSearch({
  route,
  origin,
  destination,
  routes = [],
  stops = [],
  onSelectRoute,
  onSelectOrigin,
  onSelectDestination,
  loadingRoutes = false,
  loadingStops = false,
  children, // optional extra content rendered in the same row (e.g. a CTA button)
}) {
  // Use API-fetched routes if available, fallback to local data
  const routeOptions = routes.length > 0 ? routes : allRoutes;

  // Use API-fetched stops if available, fallback to all stops
  const stopOptions = stops.length > 0 ? stops : allStops;

  return (
    <div className="route-search">
      <RouteDropdown
        placeholder="Pick a route"
        options={routeOptions}
        value={route}
        onChange={onSelectRoute}
        disabled={loadingRoutes}
      />

      <LocationDropdown
        placeholder="Pick a starting point"
        options={stopOptions}
        value={origin}
        onChange={(stop) => {
          if (stop === null) {
            onSelectOrigin(null);
            return;
          }
          onSelectOrigin(stop);
        }}
        disabled={!route || loadingStops}
      />

      <LocationDropdown
        placeholder="Pick a destination"
        options={stopOptions}
        value={destination}
        onChange={(stop) => {
          if (stop === null) {
            onSelectDestination(null);
            return;
          }
          onSelectDestination(stop);
        }}
        disabled={!route || loadingStops}
      />

      {children}
    </div>
  );
}

export default RouteSearch;