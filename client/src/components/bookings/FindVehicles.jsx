import { Component, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RouteSearch from "../RouteSearch";
import Map from "../maprelated/Map";
import {
  allRoutes,
  getRouteById,
  getStopById,
} from "../../data/nairobiRoutes";
import {
  getRouteSelection,
  getVisibleStops,
  isValidPosition,
} from "../../utils/routeSelection";
import "../../styles/findvehicles.css";

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Map rendering failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="find-vehicles__map-error">
          The map could not be displayed. You can still choose your route and
          stops from the panel.
        </div>
      );
    }

    return this.props.children;
  }
}

const SHEET_COLLAPSED = "collapsed";
const SHEET_EXPANDED = "expanded";
const DESKTOP_BREAKPOINT = 768;

async function getStopByIdFromAPI(routeId, routeStopId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/routes/${routeId}`
    );

    if (response.ok) {
      const route = await response.json();

      const routeStop = route.route_stops?.find(
        (stop) => stop.id === parseInt(routeStopId, 10)
      );

      if (routeStop) {
        return {
          id: routeStop.id,
          stop_id: routeStop.stop_id,
          name: routeStop.stop?.name || routeStop.name,
          position:
            routeStop.stop?.latitude && routeStop.stop?.longitude
              ? [routeStop.stop.latitude, routeStop.stop.longitude]
              : undefined,
          routeId,
        };
      }
    }
  } catch (error) {
    console.error(
      `Error fetching stop ${routeStopId} from route ${routeId}:`,
      error
    );
  }

  return null;
}

function FindVehicles() {
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("route");
  const fromId = searchParams.get("from");
  const toId = searchParams.get("to");

  // Home passes the selected route through the URL. Keeping this value in
  // state makes RouteSearch controlled and allows the route input to display
  // the selected route when this page opens.
  const [route, setRoute] = useState(() => getRouteById(routeId));
  const [routes, setRoutes] = useState(allRoutes);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stops, setStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const [sheetState, setSheetState] = useState(SHEET_COLLAPSED);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [booked, setBooked] = useState({});
  const [bookingStatus, setBookingStatus] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(false);
  const isResizing = useRef(false);

  // Load the route list and select the route supplied by Home.
  // The local route data remains available as a fallback when the API
  // is unavailable.
  useEffect(() => {
    let cancelled = false;

    async function fetchStops() {
      if (!route) {
        setStops([]);
        return;
      }

      setLoadingStops(true);

      try {
        const response = await fetch(
          `http://localhost:5000/api/v1/routes/${route.id}/stops?per_page=100`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch stops");
        }

        const data = await response.json();

        const apiStops = (data.items || []).map((routeStop) => ({
          ...routeStop,
          name: routeStop.name || routeStop.stop?.name || "Unnamed stop",
          position:
            routeStop.position ||
            (routeStop.stop?.latitude && routeStop.stop?.longitude
              ? [routeStop.stop.latitude, routeStop.stop.longitude]
              : undefined),
          routeId: route.id,
          routeName: route.name,
        }));

        if (!cancelled) {
          setStops(apiStops.length > 0 ? apiStops : route.stops || []);
        }
      } catch (error) {
        console.error("Error fetching stops:", error);

        if (!cancelled) {
          setStops(route.stops || []);
        }
      } finally {
        if (!cancelled) {
          setLoadingStops(false);
        }
      }
    }

    fetchStops();

    return () => {
      cancelled = true;
    };
  }, [route]);

  useEffect(() => {
    let cancelled = false;

    async function fetchVehicles() {
      if (!origin || !destination || !route) {
        setVehicles([]);
        setVehicleError("");
        return;
      }

      setLoadingVehicles(true);
      setVehicleError("");

      try {
        const today = new Date().toISOString().split("T")[0];

        const params = new URLSearchParams({
          origin_routestop_id: origin.id,
          destination_routestop_id: destination.id,
          date: today,
          per_page: "100",
        });

        const response = await fetch(
          `http://localhost:5000/api/v1/trips?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to fetch available vehicles"
          );
        }

        if (!cancelled) {
          setVehicles(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching available vehicles:", error);

        if (!cancelled) {
          setVehicles([]);
          setVehicleError(
            error.message || "Failed to load vehicles."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingVehicles(false);
        }
      }
    }

    fetchVehicles();

    return () => {
      cancelled = true;
    };
  }, [route, origin, destination]);

  useEffect(() => {
    setRoute(getRouteById(routeId));

    async function fetchRoutes() {
      setLoadingRoutes(true);

      try {
        const response = await fetch(
          "http://localhost:5000/api/v1/routes/generalinfo"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const apiRoutes = data.items || [];

        if (apiRoutes.length === 0) {
          return;
        }

        setRoutes(apiRoutes);

        const selectedRoute = apiRoutes.find(
          (candidate) => String(candidate.id) === String(routeId)
        );

        if (selectedRoute) {
          setRoute(selectedRoute);
        }
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoadingRoutes(false);
      }
    }

    fetchRoutes();
  }, [routeId]);

  useEffect(() => {
    async function fetchInitialData() {
      if (!routeId) {
        return;
      }

      setLoadingInitialData(true);

      try {
        if (fromId) {
          const stopFromAPI = await getStopByIdFromAPI(routeId, fromId);

          if (stopFromAPI && stopFromAPI.position) {
            setOrigin(stopFromAPI);
          } else {
            const fallbackStop = getStopById(fromId);

            if (fallbackStop) {
              setOrigin(fallbackStop);
            }
          }
        }

        if (toId) {
          const stopToAPI = await getStopByIdFromAPI(routeId, toId);

          if (stopToAPI && stopToAPI.position) {
            setDestination(stopToAPI);
          } else {
            const fallbackStop = getStopById(toId);

            if (fallbackStop) {
              setDestination(fallbackStop);
            }
          }
        }
      } catch (error) {
        console.error("Error loading initial route data:", error);
      } finally {
        setLoadingInitialData(false);
      }
    }

    fetchInitialData();
  }, [routeId, fromId, toId]);

  const suppressClickRef = useRef(false);
  const dragStartY = useRef(null);

  useEffect(() => {
    function onMouseMove(event) {
      if (!isResizing.current) {
        return;
      }

      const next = Math.min(600, Math.max(360, event.clientX));
      setSidebarWidth(next);
    }

    function onMouseUp() {
      if (!isResizing.current) {
        return;
      }

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
    if (window.innerWidth <= DESKTOP_BREAKPOINT) {
      return;
    }

    event.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  async function handleBook(vehicle) {
    if (
      booked[vehicle.id] ||
      bookingStatus[vehicle.id] === "failed" ||
      loadingId !== null
    ) {
      return;
    }

    setLoadingId(vehicle.id);

    setBookingStatus((previous) => ({
      ...previous,
      [vehicle.id]: "loading",
    }));

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://localhost:5000/api/v1/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            trip_id: vehicle.id,
            origin_routestop_id: origin.id,
            destination_routestop_id: destination.id,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Booking failed");
      }

      setBooked((previous) => ({
        ...previous,
        [vehicle.id]: true,
      }));

      setBookingStatus((previous) => ({
        ...previous,
        [vehicle.id]: "booked",
      }));
    } catch (error) {
      console.error("Error booking vehicle:", error);

      setBookingStatus((previous) => ({
        ...previous,
        [vehicle.id]: "failed",
      }));
    } finally {
      setLoadingId(null);
    }
  }

  function handleSelectRoute(selectedRoute) {
    setRoute(selectedRoute);
    setStops([]);
    setOrigin(null);
    setDestination(null);
    setVehicles([]);
  }

  function handleSelectOrigin(stop) {
    setOrigin(stop);
    setDestination(null);
  }

  function handleSelectDestination(stop) {
    if (stop && origin && stop.id === origin.id) {
      return;
    }

    setDestination(stop);

    if (stop && origin) {
      setSheetState(SHEET_EXPANDED);
    }
  }

  function handleSelectStop(stop) {
    if (!origin || destination) {
      setOrigin(stop);
      setDestination(null);
      return;
    }

    if (stop.id === origin.id) {
      return;
    }

    setDestination(stop);
    setSheetState(SHEET_EXPANDED);
  }

  const selection = useMemo(
    () => getRouteSelection(origin, destination),
    [origin, destination]
  );

  const hasRoute = Boolean(selection);

  // The map must not depend on the trips request. Keep the selected route's
  // stops visible even when the API returns zero trips or returns an error.
  const visibleStops = useMemo(() => {
    if (stops.length > 0) {
      return stops;
    }

    return getVisibleStops(selection);
  }, [selection, stops]);

  const mapWaypoints = useMemo(() => {
    // Do not route through every visible stop before the user has selected a
    // complete journey. Visible stops are for pins only.
    if (!origin || !destination) {
      return [];
    }

    if (selection?.waypoints?.length >= 2) {
      return selection.waypoints;
    }

    return [origin.position, destination.position].filter(
      isValidPosition
    );
  }, [destination, origin, selection]);

  const showResults =
    hasRoute && sheetState === SHEET_EXPANDED;

  function formatDeparture(startTime) {
    if (!startTime) {
      return "Scheduled";
    }

    const departure = new Date(startTime);

    if (Number.isNaN(departure.getTime())) {
      return "Scheduled";
    }

    return departure.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function toggleSheet() {
    setSheetState((previous) =>
      previous === SHEET_EXPANDED
        ? SHEET_COLLAPSED
        : SHEET_EXPANDED
    );
  }

  function handleHandlePointerDown(event) {
    dragStartY.current = event.clientY;
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleHandlePointerMove(event) {
    if (dragStartY.current === null) {
      return;
    }

    const delta = event.clientY - dragStartY.current;

    if (Math.abs(delta) > 10) {
      suppressClickRef.current = true;
    }
  }

  function handleHandlePointerUp(event) {
    if (dragStartY.current === null) {
      return;
    }

    const delta = event.clientY - dragStartY.current;
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
        <MapErrorBoundary>
          <Map
            stops={visibleStops}
            origin={origin}
            destination={destination}
            highlightedStopIds={selection?.highlightedStopIds || []}
            waypoints={mapWaypoints}
            onSelectStop={handleSelectStop}
          />
        </MapErrorBoundary>
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
            aria-label={
              sheetState === SHEET_EXPANDED
                ? "Hide vehicle list"
                : "Show vehicle list"
            }
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
            route={route}
            routes={routes}
            stops={stops}
            loadingRoutes={loadingRoutes}
            loadingStops={loadingStops}
            origin={origin}
            destination={destination}
            onSelectRoute={handleSelectRoute}
            onSelectOrigin={handleSelectOrigin}
            onSelectDestination={handleSelectDestination}
          />
        </div>

        {showResults && (
          <div className="find-vehicles__results">
            <p className="find-vehicles__results-label">
              Available vehicles
            </p>

            {loadingVehicles && (
              <p>Loading available vehicles...</p>
            )}

            {!loadingVehicles && vehicleError && (
              <p className="find-vehicles__error">
                {vehicleError}
              </p>
            )}

            {!loadingVehicles &&
              !vehicleError &&
              vehicles.length === 0 && (
                <p>
                  No vehicles are available for this route segment
                  today.
                </p>
              )}

            {!loadingVehicles &&
              !vehicleError &&
              vehicles.length > 0 && (
                <ul className="find-vehicles__vehicle-list">
                  {vehicles.map((vehicle) => {
                    const status = bookingStatus[vehicle.id];

                    const hasBookedVehicle = Object.values(
                      bookingStatus
                    ).some(
                      (booking) => booking === "booked"
                    );

                    const isDisabled =
                      hasBookedVehicle ||
                      loadingId !== null ||
                      status === "booked";

                    return (
                      <li
                        key={vehicle.id}
                        className="find-vehicles__vehicle"
                      >
                        <div className="find-vehicles__vehicle-main">
                          <span className="find-vehicles__vehicle-plate">
                            {vehicle.vehicle?.number_plate ||
                              vehicle.number_plate ||
                              "Vehicle"}
                          </span>

                          <span className="find-vehicles__vehicle-type">
                            {vehicle.vehicle?.capacity
                              ? `Vehicle · ${vehicle.vehicle.capacity}-seater`
                              : "Vehicle"}
                          </span>
                        </div>

                        <div className="find-vehicles__vehicle-meta">
                          <span>
                            {vehicle.vehicle?.sacco?.name ||
                              "Available operator"}
                          </span>

                          <span>
                            {formatDeparture(
                              vehicle.start_time
                            )}
                          </span>

                          <span className="find-vehicles__vehicle-fare">
                            —
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`find-vehicles__book${
                            status === "booked"
                              ? " is-booked"
                              : status === "failed"
                              ? " is-failed"
                              : ""
                          }`}
                          style={
                            status === "failed"
                              ? {
                                  backgroundColor: "#dc2626",
                                  color: "#fff",
                                }
                              : undefined
                          }
                          disabled={isDisabled}
                          onClick={() => handleBook(vehicle)}
                        >
                          {status === "booked"
                            ? "Arriving"
                            : status === "failed"
                            ? "Failed"
                            : loadingId === vehicle.id
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
