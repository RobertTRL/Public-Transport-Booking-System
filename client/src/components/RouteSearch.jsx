import LocationDropdown from "./maprelated/LocationDropdown";
import { allStops } from "../data/nairobiRoutes";

function RouteSearch({ origin, destination, onSelectOrigin, onSelectDestination }) {
  return (
    <div className="route-search">
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