import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";

const RouteDetail = ({ apiClient }) => {
  const { routeId } = useParams();

  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  const [showTripModal, setShowTripModal] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);

  const [selectedTripBookings, setSelectedTripBookings] = useState(null);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  const [newTrip, setNewTrip] = useState({
    origin_routestop_id: "",
    destination_routestop_id: "",
    vehicle_id: "",
    start_time: "",
    stop_time: "",
    status: "scheduled",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `/api/v1/provider/routes/${routeId}/trips`
      );

      const data = response.data;

      setTrips(
        Array.isArray(data)
          ? data
          : data.trips || data.items || []
      );
    } catch (err) {
      console.error("Failed to fetch trips", err);
    }
  }, [apiClient, routeId]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setError(null);

      try {
        const [routeRes, vehiclesRes, tripsRes] = await Promise.all([
          apiClient.get(`/api/v1/provider/routes/${routeId}`),
          apiClient.get(`/api/v1/provider/vehicles?route_id=${routeId}`),
          apiClient.get(`/api/v1/provider/routes/${routeId}/trips`),
        ]);

        if (ignore) return;

        const routeData = routeRes.data;

        setRoute(routeData);

        setStops(
          routeData.stops ||
            routeData.route_stops ||
            routeData.items ||
            []
        );

        const vData = vehiclesRes.data;

        setVehicles(
          vData.items ||
            vData.vehicles ||
            (Array.isArray(vData) ? vData : [])
        );

        const tData = tripsRes.data;

        setTrips(
          Array.isArray(tData)
            ? tData
            : tData.trips || tData.items || []
        );
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Failed to load route details."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [apiClient, routeId]);

  const resetTripForm = () => {
    setNewTrip({
      origin_routestop_id: "",
      destination_routestop_id: "",
      vehicle_id: "",
      start_time: "",
      stop_time: "",
      status: "scheduled",
    });
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();

    const originStopId = Number(newTrip.origin_routestop_id);
    const destStopId = Number(newTrip.destination_routestop_id);
    const vehicleId = Number(newTrip.vehicle_id);

    if (
      !originStopId ||
      !destStopId ||
      !vehicleId ||
      !newTrip.start_time ||
      !newTrip.stop_time
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (originStopId === destStopId) {
      alert("Origin and destination stops must be different.");
      return;
    }

    const startDate = new Date(newTrip.start_time);
    const stopDate = new Date(newTrip.stop_time);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(stopDate.getTime())
    ) {
      alert("Please enter valid dates.");
      return;
    }

    if (stopDate <= startDate) {
      alert("Stop time must be after start time.");
      return;
    }

    const payload = {
      origin_routestop_id: originStopId,
      destination_routestop_id: destStopId,
      vehicle_id: vehicleId,
      start_time: startDate.toISOString(),
      stop_time: stopDate.toISOString(),
      status: newTrip.status,
    };

    setIsCreatingTrip(true);

    try {
      await apiClient.post(
        `/api/v1/provider/routes/${routeId}/trips`,
        payload
      );

      alert("Trip created successfully!");

      setShowTripModal(false);
      resetTripForm();

      await fetchTrips();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create trip."
      );
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this trip?"
      )
    ) {
      return;
    }

    try {
      await apiClient.patch(
        `/api/v1/provider/trips/${tripId}/cancel`
      );

      await fetchTrips();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to cancel trip."
      );
    }
  };

  const handleViewBookings = async (tripId) => {
    setIsBookingsLoading(true);

    try {
      const res = await apiClient.get(
        `/api/v1/provider/trips/${tripId}/bookings`
      );

      setSelectedTripBookings({
        tripId,
        bookings:
          res.data.bookings ||
          res.data.items ||
          (Array.isArray(res.data) ? res.data : []),
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to load bookings for this trip."
      );
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const getRouteName = () => {
    return (
      route?.name ||
      route?.route_name ||
      `Route #${routeId}`
    );
  };

  const getStopName = (stop) => {
    return (
      stop?.name ||
      stop?.stop?.name ||
      stop?.stop_name ||
      `Stop #${stop?.id || stop?.route_stop_id}`
    );
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const getTripId = (trip) => {
    return trip?.id || trip?.trip_id;
  };

  const getVehicleName = (trip) => {
    if (trip?.vehicle?.number_plate) {
      return trip.vehicle.number_plate;
    }

    if (trip?.vehicle?.plate_number) {
      return trip.vehicle.plate_number;
    }

    if (trip?.number_plate) {
      return trip.number_plate;
    }

    if (trip?.vehicle_id) {
      return `Vehicle #${trip.vehicle_id}`;
    }

    return "Vehicle not assigned";
  };

  const tripModal = showTripModal
    ? createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60"
          onClick={() => {
            if (!isCreatingTrip) {
              setShowTripModal(false);
              resetTripForm();
            }
          }}
        >
          <div
            className="relative z-[100000] bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                Create New Trip
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowTripModal(false);
                  resetTripForm();
                }}
                disabled={isCreatingTrip}
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateTrip}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Origin Route Stop
                </label>

                <select
                  required
                  value={newTrip.origin_routestop_id}
                  onChange={(e) =>
                    setNewTrip((curr) => ({
                      ...curr,
                      origin_routestop_id: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 bg-white text-gray-900 cursor-pointer"
                >
                  <option value="">
                    Select Origin Stop
                  </option>

                  {stops.map((st) => {
                    const id = st.id || st.route_stop_id;

                    return (
                      <option key={id} value={id}>
                        {getStopName(st)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Destination Route Stop
                </label>

                <select
                  required
                  value={newTrip.destination_routestop_id}
                  onChange={(e) =>
                    setNewTrip((curr) => ({
                      ...curr,
                      destination_routestop_id: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 bg-white text-gray-900 cursor-pointer"
                >
                  <option value="">
                    Select Destination Stop
                  </option>

                  {stops.map((st) => {
                    const id = st.id || st.route_stop_id;

                    return (
                      <option key={id} value={id}>
                        {getStopName(st)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Vehicle
                </label>

                {vehicles.length === 0 ? (
                  <p className="text-sm text-red-600 border border-red-200 rounded p-3">
                    No vehicles assigned to this route.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vehicles.map((v) => {
                      const id = v.id ?? v.vehicle_id;

                      const plate =
                        v.number_plate ||
                        v.plate_number ||
                        `Vehicle #${id}`;

                      const isSelected =
                        String(newTrip.vehicle_id) ===
                        String(id);

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setNewTrip((curr) => ({
                              ...curr,
                              vehicle_id: String(id),
                            }));
                          }}
                          className={`w-full text-left p-3 border rounded-md cursor-pointer transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {plate}
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                {v.capacity ?? "—"} Seats
                              </p>
                            </div>

                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isSelected
                                ? "Selected"
                                : "Choose"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Start Time
                </label>

                <input
                  type="datetime-local"
                  required
                  value={newTrip.start_time}
                  onChange={(e) =>
                    setNewTrip((curr) => ({
                      ...curr,
                      start_time: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 bg-white text-gray-900 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Stop Time
                </label>

                <input
                  type="datetime-local"
                  required
                  value={newTrip.stop_time}
                  onChange={(e) =>
                    setNewTrip((curr) => ({
                      ...curr,
                      stop_time: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 bg-white text-gray-900 cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowTripModal(false);
                    resetTripForm();
                  }}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 cursor-pointer"
                  disabled={isCreatingTrip}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isCreatingTrip ||
                    !newTrip.origin_routestop_id ||
                    !newTrip.destination_routestop_id ||
                    !newTrip.vehicle_id ||
                    !newTrip.start_time ||
                    !newTrip.stop_time
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCreatingTrip
                    ? "Creating..."
                    : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!route) {
    return (
      <div className="route-not-found">
        <h1>Route Not Found</h1>
        <p>
          The requested route could not be found.
        </p>

        <Link
          to="/dashboard/routes"
          className="route-back-button"
        >
          ← Back to Routes
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link
            to="/dashboard/routes"
            className="hover:underline"
          >
            ← Routes
          </Link>

          <span>/</span>

          <span>{getRouteName()}</span>
        </div>

        <div className="route-detail-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getRouteName()}
            </h1>

            <p className="text-gray-500 mt-1">
              Manage route stops, vehicles and trips.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTripModal(true)}
            className="add-stop-button"
          >
            + Create Trip
          </button>
        </div>

        <div className="dashboard-content route-stats">
          <div className="dashboard-card">
            <h2>Stops</h2>
            <p>{stops.length}</p>
          </div>

          <div className="dashboard-card">
            <h2>Vehicles</h2>
            <p>{vehicles.length}</p>
          </div>

          <div className="dashboard-card">
            <h2>Trips</h2>
            <p>{trips.length}</p>
          </div>
        </div>

        <section className="stops-section">
          <div className="stops-header">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Route Stops
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Stops included on this route.
              </p>
            </div>
          </div>

          {stops.length === 0 ? (
            <div className="dashboard-card mt-4">
              <p className="text-gray-500">
                No stops found for this route.
              </p>
            </div>
          ) : (
            <div className="stops-grid mt-4">
              {stops.map((stop, index) => {
                const id =
                  stop.id ||
                  stop.route_stop_id ||
                  index + 1;

                return (
                  <div className="stop-card" key={id}>
                    <div className="stop-card-top">
                      <div className="stop-icon">
                        {index + 1}
                      </div>

                      <span className="stop-status">
                        Active
                      </span>
                    </div>

                    <h2>{getStopName(stop)}</h2>

                    <p className="stop-description">
                      Route stop #{id}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="vehicles-panel">
          <div className="vehicles-toolbar">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Assigned Vehicles
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Vehicles available for trips on this route.
              </p>
            </div>
          </div>

          {vehicles.length === 0 ? (
            <p className="vehicle-table-empty">
              No vehicles assigned to this route.
            </p>
          ) : (
            <div className="vehicle-table-container">
              <table className="vehicle-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => {
                    const id =
                      vehicle.id ??
                      vehicle.vehicle_id;

                    const plate =
                      vehicle.number_plate ||
                      vehicle.plate_number ||
                      `Vehicle #${id}`;

                    return (
                      <tr key={id}>
                        <td>{plate}</td>
                        <td>
                          {vehicle.capacity ?? "—"} seats
                        </td>
                        <td>
                          <span className="availability-badge availability-available">
                            Available
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="vehicles-panel">
          <div className="vehicles-toolbar">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Trips
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Trips scheduled for this route.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTripModal(true)}
              className="add-stop-button"
            >
              + Create Trip
            </button>
          </div>

          {trips.length === 0 ? (
            <p className="vehicle-table-empty">
              No trips have been created for this route yet.
            </p>
          ) : (
            <div className="vehicle-table-container">
              <table className="vehicle-table">
                <thead>
                  <tr>
                    <th>Trip</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Vehicle</th>
                    <th>Start</th>
                    <th>Stop</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {trips.map((trip, index) => {
                    const tripId = getTripId(trip);

                    const origin =
                      trip.origin_routestop?.name ||
                      trip.origin_stop?.name ||
                      trip.origin_routestop_name ||
                      trip.origin_stop_name ||
                      trip.origin_routestop_id ||
                      "—";

                    const destination =
                      trip.destination_routestop?.name ||
                      trip.destination_stop?.name ||
                      trip.destination_routestop_name ||
                      trip.destination_stop_name ||
                      trip.destination_routestop_id ||
                      "—";

                    const status =
                      trip.status || "scheduled";

                    return (
                      <tr
                        key={tripId || index}
                      >
                        <td>
                          #{tripId || index + 1}
                        </td>

                        <td>{origin}</td>

                        <td>{destination}</td>

                        <td>
                          {getVehicleName(trip)}
                        </td>

                        <td>
                          {formatDateTime(
                            trip.start_time
                          )}
                        </td>

                        <td>
                          {formatDateTime(
                            trip.stop_time
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              status === "cancelled"
                                ? "availability-badge availability-unavailable"
                                : "availability-badge availability-available"
                            }
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleViewBookings(
                                  tripId
                                )
                              }
                              className="px-3 py-1 text-xs border border-blue-600 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              Bookings
                            </button>

                            {status !==
                              "cancelled" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCancelTrip(
                                    tripId
                                  )
                                }
                                className="px-3 py-1 text-xs border border-red-600 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {tripModal}

      {selectedTripBookings &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60"
            onClick={() =>
              setSelectedTripBookings(null)
            }
          >
            <div
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">
                  Trip #{selectedTripBookings.tripId}{" "}
                  Bookings
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTripBookings(null)
                  }
                  className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                >
                  ×
                </button>
              </div>

              {isBookingsLoading ? (
                <p className="text-center text-gray-500 py-8">
                  Loading bookings...
                </p>
              ) : selectedTripBookings.bookings
                  .length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No bookings found for this trip.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedTripBookings.bookings.map(
                    (booking, index) => (
                      <div
                        key={
                          booking.id ||
                          booking.booking_id ||
                          index
                        }
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            Booking #
                            {booking.id ||
                              booking.booking_id ||
                              index + 1}
                          </span>

                          <span className="text-sm text-gray-500">
                            {booking.status ||
                              "confirmed"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                          Passenger:{" "}
                          {booking.passenger?.name ||
                            booking.user?.name ||
                            booking.passenger_name ||
                            booking.user_name ||
                            "—"}
                        </p>

                        <p className="text-sm text-gray-600">
                          Seat:{" "}
                          {booking.seat_number ||
                            booking.seat_id ||
                            "—"}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default RouteDetail;

