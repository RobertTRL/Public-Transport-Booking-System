import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import { getStopById } from "../../data/nairobiRoutes";
import { getRouteSelection, getVisibleStops } from "../../utils/routeSelection";
import { fetchWithAuth } from "../../utils/auth";
import "../../styles/findvehicles.css";

const SHEET_COLLAPSED = "collapsed";
const SHEET_EXPANDED = "expanded";
const DESKTOP_BREAKPOINT = 768;

function FindVehicles() {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("route");
  const fromId = searchParams.get("from");
  const toId = searchParams.get("to");

  const [loadingInitialData, setLoadingInitialData] = useState(!!routeId);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [sheetState, setSheetState] = useState(SHEET_COLLAPSED);

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingStops, setLoadingStops] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const [booked, setBooked] = useState({});
  const [failed, setFailed] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const [sidebarWidth, setSidebarWidth] = useState(360);
  const isResizing = useRef(false);

  const suppressClickRef = useRef(false);
  const dragStartY = useRef(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true);
      try {
        const response = await fetch("/api/v1/routes/generalinfo");
        if (response.ok) {
          const data = await response.json();
          setRoutes(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    const activeRouteId = origin?.routeId || routeId;
    if (!activeRouteId) {
      setStops([]);
      return;
    }

    const fetchStops = async () => {
      setLoadingStops(true);
      try {
        const response = await fetch(
          `/api/v1/routes/${activeRouteId}/stops?per_page=100`
        );
        if (response.ok) {
          const data = await response.json();
          const apiStops = (data.items || []).map((item) => ({
            id: item.id,
            stop_id: item.stop_id,
            name: item.stop?.name || item.name,
            position:
              item.stop?.latitude && item.stop?.longitude
                ? [item.stop.latitude, item.stop.longitude]
                : undefined,
            routeId: activeRouteId,
          }));
          setStops(apiStops);
        } else {
          setStops([]);
        }
      } catch (error) {
        console.error("Error fetching stops:", error);
        setStops([]);
      } finally {
        setLoadingStops(false);
      }
    };

    fetchStops();
  }, [origin?.routeId, routeId]);

  useEffect(() => {
    if (!origin || !destination) {
      setVehicles([]);
      return;
    }

    const fetchTrips = async () => {
      setLoadingTrips(true);
      setVehicles([]);
      setBooked({});
      setFailed({});
      setLoadingId(null);

      try {
        const today = new Date().toISOString().split("T")[0];
        const url = `/api/v1/trips?origin_routestop_id=${origin.id}&destination_routestop_id=${destination.id}&date=${today}`;

        const response = await fetchWithAuth(url, {
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.items || [];
          const mapped = items.map((trip, index) => ({
            id: trip.id ?? `trip-${index}`,
            plate: trip.vehicle?.number_plate ?? trip.number_plate ?? "—",
            type: trip.vehicle?.type ?? "Vehicle",
            operator: trip.operator ?? "—",
            departsIn: trip.departure_time ?? "—",
            fare: trip.fare ? `KSh ${trip.fare}` : "—",
          }));
          setVehicles(mapped);
        } else {
          setVehicles([]);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        setVehicles([]);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [origin, destination]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!routeId || !fromId || !toId) {
        setLoadingInitialData(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/routes/${routeId}/stops?per_page=100`
        );
        let originData = null;
        let destinationData = null;

        if (response.ok) {
          const data = await response.json();
          const apiStops = (data.items || []).map((item) => ({
            id: item.id,
            stop_id: item.stop_id,
            name: item.stop?.name || item.name,
            position:
              item.stop?.latitude && item.stop?.longitude
                ? [item.stop.latitude, item.stop.longitude]
                : undefined,
            routeId: routeId,
          }));

          originData = apiStops.find((s) => String(s.id) === String(fromId));
          destinationData = apiStops.find(
            (s) => String(s.id) === String(toId)
          );
        }

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
        setOrigin(getStopById(fromId));
        setDestination(getStopById(toId));
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
    if (window.innerWidth <= DESKTOP_BREAKPOINT) return;
    event.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  async function handleBook(vehicle) {
    if (booked[vehicle.id] || failed[vehicle.id] || loadingId === vehicle.id) {
      return;
    }

    if (!origin || !destination) return;

    setLoadingId(vehicle.id);

    try {
      const today = new Date().toISOString().split("T")[0];
      const url = `/api/v1/trips?origin_routestop_id=${origin.id}&destination_routestop_id=${destination.id}&date=${today}`;

      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          origin_routestop_id: origin.id,
          destination_routestop_id: destination.id,
          date: today,
          vehicle_id: vehicle.id,
        }),
      });

      if (response.ok) {
        setBooked((prev) => ({ ...prev, [vehicle.id]: true }));
        setFailed((prev) => {
          const next = { ...prev };
          delete next[vehicle.id];
          return next;
        });
      } else {
        setFailed((prev) => ({ ...prev, [vehicle.id]: true }));
        setBooked((prev) => {
          const next = { ...prev };
          delete next[vehicle.id];
          return next;
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      setFailed((prev) => ({ ...prev, [vehicle.id]: true }));
      setBooked((prev) => {
        const next = { ...prev };
        delete next[vehicle.id];
        return next;
      });
    } finally {
      setLoadingId(null);
    }
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

  const selectedRoute = routes.find((r) => r.id === (origin?.routeId || routeId)) || null;

  function toggleSheet() {
    setSheetState((prev) => (prev === SHEET_EXPANDED ? SHEET_COLLAPSED : SHEET_EXPANDED));
  }

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
        style={{ "--sidebar-width": `${sidebarWidth}px` }}
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
            route={selectedRoute}
            origin={origin}
            destination={destination}
            routes={routes}
            stops={stops}
            onSelectRoute={(selected) => {
              setOrigin(selected);
              setDestination(null);
            }}
            onSelectOrigin={handleSelectOrigin}
            onSelectDestination={handleSelectDestination}
            loadingRoutes={loadingRoutes}
            loadingStops={loadingStops}
          />
        </div>

        {showResults && (
          <div className="find-vehicles__results">
            <p className="find-vehicles__results-label">Available vehicles</p>
            {loadingTrips ? (
              <p className="find-vehicles__results-loading">Loading vehicles…</p>
            ) : (
              <ul className="find-vehicles__vehicle-list">
                {vehicles.map((vehicle) => {
                  const isBooked = booked[vehicle.id];
                  const isFailed = failed[vehicle.id];
                  const isLoading = loadingId === vehicle.id;

                  return (
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
                        className={[
                          "find-vehicles__book",
                          isBooked && "is-booked",
                          isFailed && "is-failed",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={isBooked || isFailed || isLoading}
                        onClick={() => handleBook(vehicle)}
                      >
                        {isBooked
                          ? "Arriving"
                          : isFailed
                          ? "Failed"
                          : isLoading
                          ? "Booking..."
                          : "Book"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

export default FindVehicles;
