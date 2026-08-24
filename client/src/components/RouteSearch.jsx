import LocationDropdown from "./maprelated/LocationDropdown";
import { allStops } from "../data/nairobiRoutes";

function RouteSearch({ origin, destination, onSelectOrigin, onSelectDestination }) {
  function handleSwap() {
    if (!origin && !destination) return;
    const prevOrigin = origin;
    const prevDest = destination;
    onSelectOrigin(prevDest);
    // Small delay to let parent state settle before setting the second value
    setTimeout(() => onSelectDestination(prevOrigin), 0);
  }

  return (
    <div className="route-search">
      <LocationDropdown
        label="From"
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

      <button
        type="button"
        className="route-search__swap"
        onClick={handleSwap}
        aria-label="Swap origin and destination"
        disabled={!origin && !destination}
      >
        ⇄
      </button>

      <LocationDropdown
        label="To"
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