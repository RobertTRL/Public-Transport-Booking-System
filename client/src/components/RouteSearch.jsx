import LocationDropdown from "./LocationDropdown";
import { allStops } from "../data/nairobiRoutes";

function RouteSearch({ origin, destination, onSelectOrigin, onSelectDestination }) {
  return (
    <div className="route-search">
      <LocationDropdown
        label="From"
        placeholder="Pick a starting point"
        options={allStops}
        value={origin}
        onChange={onSelectOrigin}
      />

      <LocationDropdown
        label="To"
        placeholder="Pick a destination"
        options={allStops}
        value={destination}
        onChange={onSelectDestination}
      />
    </div>
  );
}

export default RouteSearch;