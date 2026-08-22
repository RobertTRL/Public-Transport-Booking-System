import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { allStops } from "../../data/nairobiRoutes";
import { getRouteSelection } from "../../utils/routeSelection";
import "../../styles/findvehicles.css";

const SHEET_COLLAPSED = "collapsed";
const SHEET_EXPANDED = "expanded";

// Dummy data — real vehicle/availability data isn't wired up yet
const DUMMY_VEHICLES = [
  { id: "v1", plate: "KDA 214B", type: "Matatu · 14-seater", operator: "Super Metro", departsIn: "3 min", fare: "KSh 100" },
  { id: "v2", plate: "KCX 771T", type: "Bus · 33-seater", operator: "Citi Hoppa", departsIn: "7 min", fare: "KSh 80" },
  { id: "v3", plate: "KDB 552L", type: "Matatu · 14-seater", operator: "Metro Trans", departsIn: "12 min", fare: "KSh 100" },
];

function FindVehicles() {
  const [searchParams] = useSearchParams();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [sheetState, setSheetState] = useState(SHEET_COLLAPSED);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const fromId = searchParams.get("from");
    const toId = searchParams.get("to");
    const fromStop = allStops.find((stop) => stop.id === fromId);
    const toStop = allStops.find((stop) => stop.id === toId);
    if (fromStop) setOrigin(fromStop);
    if (toStop) setDestination(toStop);
    // Seeds initial state from Home's handoff only — after this, the sheet
    // owns origin/destination, so deps are intentionally empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectOrigin(stop) {
    setOrigin(stop);
    setDestination(null);
  }

  function handleSelectDestination(stop) {
    if (origin && stop.id === origin.id) return;
    setDestination(stop);
  }

  function handleSelectStop(stop) {
    if (!origin || (origin && destination)) {
      setOrigin(stop);
      setDestination(null);
      return;
    }
    if (stop.id === origin.id) return;
    setDestination(stop);
  }

  const selection = useMemo(() => getRouteSelection(origin, destination), [origin, destination]);
  const hasRoute = Boolean(selection);

  // Auto-expand once a route is found, so the vehicle list is visible without a manual drag
  useEffect(() => {
    if (hasRoute) setSheetState(SHEET_EXPANDED);
  }, [hasRoute]);

  function toggleSheet() {
    setSheetState((prev) => (prev === SHEET_EXPANDED ? SHEET_COLLAPSED : SHEET_EXPANDED));
  }

  function handleHandleClick() {
    if (suppressClickRef.current) {
      // tail end of a drag we already resolved in pointerup — swallow this once
      suppressClickRef.current = false;
      return;
    }
    toggleSheet();
  }

  function handlePointerDown(event) {
    const startY = event.clientY;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    function handlePointerMove(moveEvent) {
      if (Math.abs(moveEvent.clientY - startY) > 10) {
        suppressClickRef.current = true;
      }
    }

    function handlePointerUp(upEvent) {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      if (!suppressClickRef.current) return; // plain tap — onClick handles it

      const delta = upEvent.clientY - startY;
      // Mobile sheet is anchored top (drag down = expand).
      // Desktop sheet is anchored bottom (drag up = expand).
      const expandDelta = isDesktop ? -delta : delta;
      setSheetState(expandDelta > 0 ? SHEET_EXPANDED : SHEET_COLLAPSED);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div className="find-vehicles">
      <div className="find-vehicles__map">
        <Map
          stops={allStops}
          origin={origin}
          destination={destination}
          highlightedStopIds={selection?.highlightedStopIds || []}
          waypoints={selection?.waypoints}
          onSelectStop={handleSelectStop}
        />
      </div>

      <div className={`find-vehicles__sheet find-vehicles__sheet--${sheetState}`}>
        <button
          type="button"
          className="find-vehicles__handle"
          onClick={handleHandleClick}
          onPointerDown={handlePointerDown}
          aria-label="Expand or collapse trip details"
        >
          <span className="find-vehicles__handle-bar" />
        </button>

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
      </div>
    </div>
  );
}

export default FindVehicles;