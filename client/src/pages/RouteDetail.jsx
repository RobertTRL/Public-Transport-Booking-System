import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { createPortal } from "react-dom";  

const RouteDetail = ({ apiClient }) => {
  const { routeId } = useParams();

  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  // Modals state
  const [showTripModal, setShowTripModal] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);

  const [selectedTripBookings, setSelectedTripBookings] = useState(null);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  // Form State
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
      const response = await apiClient.get(`/api/v1/provider/routes/${routeId}/trips`);
      const data = response.data;
      setTrips(Array.isArray(data) ? data : data.trips || data.items || []);
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
        setStops(routeData.stops || routeData.route_stops || routeData.items || []);

        const vData = vehiclesRes.data;
        setVehicles(vData.items || vData.vehicles || (Array.isArray(vData) ? vData : []));

        const tData = tripsRes.data;
        setTrips(Array.isArray(tData) ? tData : tData.trips || tData.items || []);
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load route details.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
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

    if (!originStopId || !destStopId || !vehicleId || !newTrip.start_time || !newTrip.stop_time) {
      alert("Please fill in all fields.");
      return;
    }

    if (originStopId === destStopId) {
      alert("Origin and destination stops must be different.");
      return;
    }

    const startDate = new Date(newTrip.start_time);
    const stopDate = new Date(newTrip.stop_time);

    if (isNaN(startDate.getTime()) || isNaN(stopDate.getTime())) {
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
      await apiClient.post(`/api/v1/provider/routes/${routeId}/trips`, payload);
      alert("Trip created successfully!");
      setShowTripModal(false);
      resetTripForm();
      await fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to create trip.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    try {
      await apiClient.patch(`/api/v1/provider/trips/${tripId}/cancel`);
      await fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel trip.");
    }
  };

  const handleViewBookings = async (tripId) => {
    setIsBookingsLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/provider/trips/${tripId}/bookings`);
      setSelectedTripBookings({
        tripId,
        bookings: res.data.bookings || res.data.items || (Array.isArray(res.data) ? res.data : []),
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load bookings for this trip.");
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const tripModal = showTripModal
    ? createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 pointer-events-auto">
          <div
            className="relative z-[100000] bg-white rounded-lg p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Create New Trip</h2>

              <button
                type="button"
                onClick={() => {
                  setShowTripModal(false);
                  resetTripForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4 text-sm">
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
                  <option value="">Select Origin Stop</option>

                  {stops.map((st) => {
                    const id = st.id || st.route_stop_id;

                    return (
                      <option key={id} value={id}>
                        {st.name || st.stop?.name || `Stop #${id}`}
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
                  <option value="">Select Destination Stop</option>

                  {stops.map((st) => {
                    const id = st.id || st.route_stop_id;

                    return (
                      <option key={id} value={id}>
                        {st.name || st.stop?.name || `Stop #${id}`}
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
                        v.number_plate || v.plate_number || `Vehicle #${id}`;

                      const isSelected =
                        String(newTrip.vehicle_id) === String(id);

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
                                {v.capacity} Seats
                              </p>
                            </div>

                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isSelected ? "Selected" : "Choose"}
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
                  {isCreatingTrip ? "Creating..." : "Create Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
        <Link to="/dashboard/routes" className="hover:underline">
          ← Back to Routes
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{route?.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{route?.description}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetTripForm();
            setShowTripModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium cursor-pointer"
        >
          + Create Trip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Stops */}
        <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Route Stops</h2>
          {stops.length === 0 ? (
            <p className="text-sm text-gray-500">No stops configured.</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-3 space-y-4">
              {stops.map((st, index) => {
                const stopId = st.id || st.route_stop_id || index;
                return (
                  <li key={stopId} className="mb-4 ml-4">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.5 border border-white" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      {st.name || st.stop?.name || `Stop #${stopId}`}
                    </h3>
                    <p className="text-xs text-gray-500">Stop Order #{index + 1}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Assigned Vehicles */}
        <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Assigned Vehicles</h2>
          {vehicles.length === 0 ? (
            <p className="text-sm text-gray-500">No vehicles assigned to this route.</p>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => {
                const id = v.id ?? v.vehicle_id;
                const plate = v.number_plate || v.plate_number || `Vehicle #${id}`;
                return (
                  <div key={id} className="p-3 border rounded-md flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-800">{plate}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {v.capacity} Seats
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Route Trips */}
        <div className="bg-white p-5 rounded-lg border shadow-sm space-y-4 lg:col-span-3">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Route Trips</h2>
          {trips.length === 0 ? (
            <p className="text-sm text-gray-500">No scheduled trips found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs text-gray-500 font-semibold">
                    <th className="p-3">Trip ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Start Time</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trips.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">#{t.id}</td>
                      <td className="p-3">
                        {t.vehicle_number_plate || t.vehicle?.number_plate || `Vehicle #${t.vehicle_id}`}
                      </td>
                      <td className="p-3">
                        {t.start_time ? new Date(t.start_time).toLocaleString() : "N/A"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            t.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-3">
                        <button
                          type="button"
                          onClick={() => handleViewBookings(t.id)}
                          className="text-blue-600 hover:underline text-xs cursor-pointer"
                        >
                          Bookings
                        </button>
                        {t.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleCancelTrip(t.id)}
                            className="text-red-600 hover:underline text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bookings Modal */}
      {selectedTripBookings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-bold">
                Bookings for Trip #{selectedTripBookings.tripId}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedTripBookings(null)}
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isBookingsLoading ? (
              <p className="text-center text-gray-500 py-4">Loading bookings...</p>
            ) : selectedTripBookings.bookings.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No passenger bookings for this trip.</p>
            ) : (
              <div className="space-y-3">
                {selectedTripBookings.bookings.map((b, i) => (
                  <div key={b.id || i} className="p-3 border rounded-md text-sm flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {b.passenger_name || b.user?.name || `Passenger #${b.user_id || b.id}`}
                      </p>
                      <p className="text-xs text-gray-500">Seat: {b.seat_number || "Assigned"}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded self-center">
                      {b.status || "Booked"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tripModal}
    </div>
  );
};

export default RouteDetail;