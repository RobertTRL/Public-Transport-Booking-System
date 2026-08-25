import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { getStopById } from "../../data/nairobiRoutes";
import { getRouteSelection, getVisibleStops } from "../../utils/routeSelection";
import "../../styles/findvehicles.css";

const SHEET_COLLAPSED = "collapsed";
const SHEET_EXPANDED = "expanded";

const DUMMY_VEHICLES = [
  { id: "v1", plate: "KDA 214B", type: "Matatu · 14-seater", operator: "Super Metro", departsIn: "3 min", fare: "KSh 100" },
  { id: "v2", plate: "KCX 771T", type: "Bus · 33-seater", operator: "Citi Hoppa", departsIn: "7 min", fare: "KSh 80" },
  { id: "v3", plate: "KDB 552L", type: "Matatu · 14-seater", operator: "Metro Trans", departsIn: "12 min", fare: "KSh 100" },
];

function FindVehicles() {
  const [searchParams] = useSearchParams();

  // Seed initial state from URL search params (Home handoff)
  const initialOrigin = getStopById(searchParams.get("from"));
  const initialDestination = getStopById(searchParams.get("to"));

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [sheetState, setSheetState] = useState(
    initialOrigin && initialDestination ? SHEET_EXPANDED : SHEET_COLLAPSED
  );
  const suppressClickRef = useRef(false);

  function handleSelectOrigin(stop) {
    setOrigin(stop);
    setDestination(null);
  }

  function handleSelectDestination(stop) {
    if (stop && origin && stop.id === origin.id) return;
    setDestination(stop);
    if (stop && origin) setSheetState(SHEET_EXPANDED);
  }

  function handleSelectStop(stop) {
    if (!origin || destination) {
      setOrigin(stop);
      setDestination(null);
      return;
    }
    if (stop.id === origin.id) return;
    setDestination(stop);
    setSheetState(SHEET_EXPANDED);
  }

  const selection = useMemo(() => getRouteSelection(origin, destination), [origin, destination]);
  const hasRoute = Boolean(selection);
  const visibleStops = useMemo(() => getVisibleStops(selection), [selection]);

  function toggleSheet() {
    setSheetState((prev) => (prev === SHEET_EXPANDED ? SHEET_COLLAPSED : SHEET_EXPANDED));
  }

  return (
    <div className="find-vehicles">
      <div className="find-vehicles__map">
        <Map
          stops={visibleStops}
          origin={origin}
          destination={destination}
          highlightedStopIds={selection?.highlightedStopIds || []}
          waypoints={selection?.waypoints}
          onSelectStop={handleSelectStop}
        />
      </div>

      <aside className="find-vehicles__sidebar">
        <div className="find-vehicles__sidebar-header">
          <h2>Find your route</h2>
          <p>Select your starting point and destination.</p>
        </div>

        <div className="find-vehicles__search">
          <RouteSearch
            origin={origin}
            destination={destination}
            onSelectOrigin={handleSelectOrigin}
            onSelectDestination={handleSelectDestination}
          />
        </div>

        {hasRoute && (
          <div className="find-vehicles__results">
            <p className="find-vehicles__results-label">Available vehicles</p>
            <ul className="find-vehicles__vehicle-list">
              {DUMMY_VEHICLES.map((vehicle) => (
                <li key={vehicle.id} className="find-vehicles__vehicle">
                  <div className="find-vehicles__vehicle-main">
                    <span className="find-vehicles__vehicle-plate">{vehicle.plate}</span>
                    <span className="find-vehicles__vehicle-type">{vehicle.type}</span>
                  </div>
                  <div className="find-vehicles__vehicle-meta">
                    <span>{vehicle.operator}</span>
                    <span>{vehicle.departsIn}</span>
                    <span className="find-vehicles__vehicle-fare">{vehicle.fare}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

export default FindVehicles;