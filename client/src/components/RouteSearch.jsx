import RouteDropdown from "./maprelated/RouteDropdown";
import LocationDropdown from "./maprelated/LocationDropdown";
import { allStops, allRoutes } from "../data/nairobiRoutes";

function RouteSearch({
  route,
  origin,
  destination,
  onSelectRoute,
  onSelectOrigin,
  onSelectDestination,
}) {
  return (
    <div className="route-search">
      <RouteDropdown
        placeholder="Pick a route"
        options={allRoutes}
        value={route}
        onChange={onSelectRoute}
      />

      <LocationDropdown
        placeholder="Pick a starting point"
        options={allStops}
        value={origin}
        onChange={(stop) => {
          if (stop === null) {
            onSelectOrigin(null);
            return;
          }
          onSelectOrigin(stop);
        }}
      />

      <LocationDropdown
        placeholder="Pick a destination"
        options={allStops}
        value={destination}
        onChange={(stop) => {
          if (stop === null) {
            onSelectDestination(null);
            return;
          }
          onSelectDestination(stop);
        }}
      />
    </div>
  );
}

export default RouteSearch;