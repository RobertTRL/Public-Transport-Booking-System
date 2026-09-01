import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Plus, X } from "lucide-react";
import {
  getRoute,
  listVehicles,
  listRouteTrips,
  createTrip,
  cancelTrip,
  getTripBookings,
} from "../../api/providerClient";
import "../../styles/Vehicle.css";

const ACTIVE_TRIP_STATUSES = ["scheduled", "in_progress"];

function toIso(datetimeLocalValue) {
  if (!datetimeLocalValue) return undefined;
  const date = new Date(datetimeLocalValue);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function TripRow({ trip, onCancel, cancelling, onToggleBookings, isOpen, bookings, bookingsLoading }) {
  return (
    <>
      <tr>
        <td>#{trip.id}</td>
        <td>{trip.start_time ? new Date(trip.start_time).toLocaleString() : "—"}</td>
        <td>{trip.stop_time ? new Date(trip.stop_time).toLocaleString() : "—"}</td>
        <td>Vehicle #{trip.vehicle_id}</td>
        <td>
          <span className={`availability-badge availability-${trip.status === "cancelled" ? "unavailable" : "available"}`}>
            {trip.status}
          </span>
        </td>
        <td className="vehicle-row-actions">
          <button type="button" onClick={() => onToggleBookings(trip.id)}>
            {isOpen ? "Hide bookings" : "View bookings"}
          </button>
          {ACTIVE_TRIP_STATUSES.includes(trip.status) && (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel(trip)}
            >
              Cancel
            </button>
          )}
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan="6">
            {bookingsLoading ? (
              <p>Loading bookings...</p>
            ) : bookings && bookings.length > 0 ? (
              <ul className="trip-bookings-list">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    Booking #{booking.id} · passenger #{booking.user_id} · stop {booking.origin_routestop_id} → {booking.destination_routestop_id}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No bookings for this trip yet.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();

  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [routeLoading, setRouteLoading] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState("");

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState("");
  const [tripsFrom, setTripsFrom] = useState("");
  const [tripsTo, setTripsTo] = useState("");

  const [showTripForm, setShowTripForm] = useState(false);
  const [tripForm, setTripForm] = useState({
    origin_routestop_id: "",
    destination_routestop_id: "",
    vehicle_id: "",
    start_time: "",
    stop_time: "",
  });
  const [creatingTrip, setCreatingTrip] = useState(false);
  const [tripFormError, setTripFormError] = useState("");

  const [cancellingId, setCancellingId] = useState(null);
  const [openBookingsTripId, setOpenBookingsTripId] = useState(null);
  const [bookingsByTrip, setBookingsByTrip] = useState({});
  const [bookingsLoadingId, setBookingsLoadingId] = useState(null);

  useEffect(() => {
    async function loadRoute() {
      setRouteLoading(true);
      setRouteError("");
      try {
        const data = await getRoute(routeId);
        setRoute(data);
      } catch (err) {
        setRouteError(err.message);
      } finally {
        setRouteLoading(false);
      }
    }
    loadRoute();
  }, [routeId]);

  useEffect(() => {
    listVehicles({ route_id: routeId, per_page: 100 })
      .then((data) => setVehicles(data.items || []))
      .catch(() => setVehicles([]));
  }, [routeId]);

  const loadTrips = useCallback(() => {
    setTripsLoading(true);
    setTripsError("");
    return listRouteTrips(routeId, {
      from: toIso(tripsFrom),
      to: toIso(tripsTo),
      per_page: 50,
    })
      .then((data) => setTrips(data.items || []))
      .catch((err) => setTripsError(err.message))
      .finally(() => setTripsLoading(false));
  }, [routeId, tripsFrom, tripsTo]);

  useEffect(() => {
    (async () => {
      await loadTrips();
    })();
  }, [loadTrips]);

  const totalCapacity = vehicles.reduce((sum, vehicle) => sum + vehicle.capacity, 0);

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.number_plate.toLowerCase().includes(query.toLowerCase())
  );

  const orderedStops = route
    ? [...route.stops].sort((a, b) => a.sequence - b.sequence)
    : [];

  const handleCreateTrip = async (event) => {
    event.preventDefault();
    setCreatingTrip(true);
    setTripFormError("");

    try {
      const created = await createTrip(routeId, {
        origin_routestop_id: Number(tripForm.origin_routestop_id),
        destination_routestop_id: Number(tripForm.destination_routestop_id),
        vehicle_id: Number(tripForm.vehicle_id),
        start_time: toIso(tripForm.start_time),
        stop_time: toIso(tripForm.stop_time),
        status: "scheduled",
      });
      setTrips((list) => [...list, created]);
      setShowTripForm(false);
      setTripForm({
        origin_routestop_id: "",
        destination_routestop_id: "",
        vehicle_id: "",
        start_time: "",
        stop_time: "",
      });
    } catch (err) {
      setTripFormError(err.message);
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleCancelTrip = async (trip) => {
    if (!window.confirm(`Cancel trip #${trip.id}?`)) return;
    setCancellingId(trip.id);
    try {
      const updated = await cancelTrip(trip.id);
      setTrips((list) => list.map((item) => (item.id === trip.id ? updated : item)));
    } catch (err) {
      setTripsError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleToggleBookings = async (tripId) => {
    if (openBookingsTripId === tripId) {
      setOpenBookingsTripId(null);
      return;
    }

    setOpenBookingsTripId(tripId);

    if (!bookingsByTrip[tripId]) {
      setBookingsLoadingId(tripId);
      try {
        const data = await getTripBookings(tripId, { per_page: 50 });
        setBookingsByTrip((current) => ({ ...current, [tripId]: data.items || [] }));
      } catch {
        setBookingsByTrip((current) => ({ ...current, [tripId]: [] }));
      } finally {
        setBookingsLoadingId(null);
      }
    }
  };

  if (routeLoading) {
    return <p>Loading route...</p>;
  }

  if (routeError || !route) {
    return (
      <div className="route-not-found">
        <h1>Route not found</h1>
        <p>{routeError || `No route matches id "${routeId}".`}</p>
        <button
          type="button"
          className="route-back-button"
          onClick={() => navigate("/dashboard/routes")}
        >
          <ArrowLeft size={16} />
          Back to routes
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-header route-detail-header">
        <div>
          <button
            type="button"
            className="route-back-button"
            onClick={() => navigate("/dashboard/routes")}
          >
            <ArrowLeft size={16} />
            Routes
          </button>

          <h1>{route.name}</h1>
          <p>{orderedStops.map((stop) => stop.name).join(" → ")}</p>
        </div>

        <span
          className="route-color-dot route-color-dot-lg"
          style={{ background: route.color }}
        />
      </div>

      <section className="dashboard-content route-stats">
        <div className="dashboard-card">
          <h2>Vehicles on route</h2>
          <p>{vehicles.length}</p>
        </div>

        <div className="dashboard-card">
          <h2>Total capacity</h2>
          <p>{totalCapacity}</p>
        </div>

        <div className="dashboard-card">
          <h2>Stops</h2>
          <p>{orderedStops.length}</p>
        </div>
      </section>

      <section className="vehicles-panel">
        <div className="vehicles-toolbar">
          <div className="vehicle-search">
            <Search size={16} className="vehicle-search-icon" />
            <input
              type="text"
              placeholder="Search by number plate..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="vehicle-table-container">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Number Plate</th>
                <th>Capacity</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.number_plate}</td>
                    <td>{vehicle.capacity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="vehicle-table-empty">
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vehicles-panel">
        <div className="dashboard-header">
          <h2>Trips</h2>
          <button type="button" className="add-vehicle-button" onClick={() => setShowTripForm((open) => !open)}>
            {showTripForm ? <X size={16} /> : <Plus size={16} />}
            {showTripForm ? "Close" : "Schedule Trip"}
          </button>
        </div>

        {showTripForm && (
          <form className="modal-form" onSubmit={handleCreateTrip}>
            {tripFormError && <p className="modal-error">{tripFormError}</p>}

            <div className="modal-field">
              <label>Origin stop</label>
              <select
                value={tripForm.origin_routestop_id}
                onChange={(event) =>
                  setTripForm((form) => ({ ...form, origin_routestop_id: event.target.value }))
                }
                required
              >
                <option value="">Select stop</option>
                {orderedStops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Destination stop</label>
              <select
                value={tripForm.destination_routestop_id}
                onChange={(event) =>
                  setTripForm((form) => ({ ...form, destination_routestop_id: event.target.value }))
                }
                required
              >
                <option value="">Select stop</option>
                {orderedStops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Vehicle</label>
              <select
                value={tripForm.vehicle_id}
                onChange={(event) =>
                  setTripForm((form) => ({ ...form, vehicle_id: event.target.value }))
                }
                required
              >
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.number_plate}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Start time</label>
              <input
                type="datetime-local"
                value={tripForm.start_time}
                onChange={(event) =>
                  setTripForm((form) => ({ ...form, start_time: event.target.value }))
                }
                required
              />
            </div>

            <div className="modal-field">
              <label>Stop time (optional)</label>
              <input
                type="datetime-local"
                value={tripForm.stop_time}
                onChange={(event) =>
                  setTripForm((form) => ({ ...form, stop_time: event.target.value }))
                }
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="modal-submit" disabled={creatingTrip}>
                {creatingTrip ? "Scheduling..." : "Schedule Trip"}
              </button>
            </div>
          </form>
        )}

        <div className="vehicles-toolbar">
          <label>
            From
            <input
              type="datetime-local"
              value={tripsFrom}
              onChange={(event) => setTripsFrom(event.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="datetime-local"
              value={tripsTo}
              onChange={(event) => setTripsTo(event.target.value)}
            />
          </label>
        </div>

        {tripsError && <p className="vehicle-table-error">{tripsError}</p>}

        <div className="vehicle-table-container">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Start</th>
                <th>Stop</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tripsLoading ? (
                <tr>
                  <td colSpan="6" className="vehicle-table-empty">Loading trips...</td>
                </tr>
              ) : trips.length > 0 ? (
                trips.map((trip) => (
                  <TripRow
                    key={trip.id}
                    trip={trip}
                    onCancel={handleCancelTrip}
                    cancelling={cancellingId === trip.id}
                    onToggleBookings={handleToggleBookings}
                    isOpen={openBookingsTripId === trip.id}
                    bookings={bookingsByTrip[trip.id]}
                    bookingsLoading={bookingsLoadingId === trip.id}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="vehicle-table-empty">No trips scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default RouteDetail;
