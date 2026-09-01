import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { getStopById } from "../../data/nairobiRoutes";
import { getRouteSelection, getVisibleStops } from "../../utils/routeSelection";
import { bookVehicle } from "../../api/mockApi";
import "../../styles/findvehicles.css";

const SHEET_COLLAPSED = "collapsed";
const SHEET_EXPANDED = "expanded";

const DUMMY_VEHICLES = [
  { id: "v1", plate: "KDA 214B", type: "Matatu · 14-seater", operator: "Super Metro", departsIn: "3 min", fare: "KSh 100" },
  { id: "v2", plate: "KCX 771T", type: "Bus · 33-seater", operator: "Citi Hoppa", departsIn: "7 min", fare: "KSh 80" },
  { id: "v3", plate: "KDB 552L", type: "Matatu · 14-seater", operator: "Metro Trans", departsIn: "12 min", fare: "KSh 100" },
];

// Helper function to fetch stop data from API
async function getStopByIdFromAPI(routeId, routeStopId) {
  try {
    const response = await fetch(`http://localhost:5000/api/v1/routes/${routeId}`);
    if (response.ok) {
      const route = await response.json();
      // Find the route stop with the given ID
      const routeStop = route.route_stops?.find(rs => rs.id === parseInt(routeStopId));
      if (routeStop) {
        return {
          id: routeStop.id,
          stop_id: routeStop.stop_id,
          name: routeStop.stop?.name || routeStop.name,
          position: routeStop.stop?.latitude && routeStop.stop?.longitude
            ? [routeStop.stop.latitude, routeStop.stop.longitude]
            : undefined,
          routeId: routeId
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching stop ${routeStopId} from route ${routeId}:`, error);
  }
  return null;
}

function FindVehicles() {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("route");
  const fromId = searchParams.get("from");
  const toId = searchParams.get("to");

  const [loadingInitialData, setLoadingInitialData] = useState(!!routeId);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [sheetState, setSheetState] = useState(SHEET_COLLAPSED);

  const [booked, setBooked] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const [sidebarWidth, setSidebarWidth] = useState(360);
  const isResizing = useRef(false);

  const suppressClickRef = useRef(false);
  const dragStartY = useRef(null);

  // Fetch initial origin and destination from API if route ID is available
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!routeId || !fromId || !toId) {
        const fallbackOrigin = getStopById(fromId);
        const fallbackDestination = getStopById(toId);

        setOrigin(fallbackOrigin);
        setDestination(fallbackDestination);
        setSheetState(
          fallbackOrigin && fallbackDestination
            ? SHEET_EXPANDED
            : SHEET_COLLAPSED
        );
        setLoadingInitialData(false);
        return;
      }

      try {
        const originData = await getStopByIdFromAPI(routeId, fromId);
        const destinationData = await getStopByIdFromAPI(routeId, toId);

        const finalOrigin = originData || getStopById(fromId);
        const finalDestination = destinationData || getStopById(toId);

        setOrigin(finalOrigin);
        setDestination(finalDestination);
        setSheetState(
          finalOrigin && finalDestination
            ? SHEET_EXPANDED
            : SHEET_COLLAPSED
        );
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Fallback to local data
        const fallbackOrigin = getStopById(fromId);
        const fallbackDestination = getStopById(toId);

        setOrigin(fallbackOrigin);
        setDestination(fallbackDestination);
        setSheetState(
          fallbackOrigin && fallbackDestination
            ? SHEET_EXPANDED
            : SHEET_COLLAPSED
        );
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchInitialData();
  }, [routeId, fromId, toId]);

  useEffect(() => {
    function onMouseMove(event) {
      if (!isResizing.current) return;
      const next = Math.min(600, Math.max(360, event.clientX));
      setSidebarWidth(next);
    }

    function onMouseUp() {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function startResizing(event) {
    event.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  async function handleBook(vehicle) {
    if (booked[vehicle.id] || loadingId === vehicle.id) return;
    setLoadingId(vehicle.id);
    await bookVehicle(vehicle);
    setBooked((prev) => ({ ...prev, [vehicle.id]: true }));
    setLoadingId(null);
  }

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
  
  const showResults = hasRoute && sheetState === SHEET_EXPANDED;

  function toggleSheet() {
    setSheetState((prev) => (prev === SHEET_EXPANDED ? SHEET_COLLAPSED : SHEET_EXPANDED));
  }

  // Mobile-only: drag the handle to snap the sheet open/closed.
  function handleHandlePointerDown(e) {
    dragStartY.current = e.clientY;
    suppressClickRef.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handleHandlePointerMove(e) {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > 10) suppressClickRef.current = true;
  }

  function handleHandlePointerUp(e) {
    if (dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    dragStartY.current = null;

    if (delta < -40) {
      setSheetState(SHEET_EXPANDED);
    } else if (delta > 40) {
      setSheetState(SHEET_COLLAPSED);
    } else if (!suppressClickRef.current) {
      toggleSheet();
    }
    suppressClickRef.current = false;
  }

  if (loadingInitialData) {
    return (
      <div className="find-vehicles">
        <div className="find-vehicles__map">
          <p>Loading route information...</p>
        </div>
      </div>
    );
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

      <aside
        className={`find-vehicles__sidebar find-vehicles__sidebar--${sheetState}`}
        style={{ width: sidebarWidth }}
      >
        <div
          className="find-vehicles__resize-handle"
          onMouseDown={startResizing}
          aria-hidden="true"
        />
        {hasRoute && (
          <button
            type="button"
            className="find-vehicles__sheet-handle"
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            aria-label={sheetState === SHEET_EXPANDED ? "Hide vehicle list" : "Show vehicle list"}
          >
            <span className="find-vehicles__sheet-handle-bar" />
          </button>
        )}

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

        {showResults && (
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
                  <button
                    type="button"
                    className={`find-vehicles__book${booked[vehicle.id] ? " is-booked" : ""}`}
                    disabled={booked[vehicle.id] || loadingId === vehicle.id}
                    onClick={() => handleBook(vehicle)}
                  >
                    {booked[vehicle.id]
                      ? "Arriving"
                      : loadingId === vehicle.id
                      ? "Booking..."
                      : "Book"}
                  </button>
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