import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";

function DashboardSummary() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const data = await apiGet("/api/v1/provider/dashboard");

        if (cancelled) return;

        setDashboard(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {};
  const provider = dashboard?.provider || {};

  const providerName =
    provider.name ||
    provider.user?.name ||
    dashboard?.provider_name ||
    "Provider";

  const saccoName =
    provider.sacco?.name ||
    provider.sacco_name ||
    dashboard?.sacco_name ||
    "SACCO";

  const recentTrips =
    dashboard?.recent_trips ||
    dashboard?.recentTrips ||
    [];

  const recentBookings =
    dashboard?.recent_bookings ||
    dashboard?.recentBookings ||
    [];

  return (
    <>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, {providerName}. {saccoName}
        </p>
      </div>

      <section className="dashboard-content">
        <div className="dashboard-card">
          <h2>Total Routes</h2>
          <p>{metrics.total_routes ?? 0}</p>
        </div>

        <div className="dashboard-card">
          <h2>Total Bookings</h2>
          <p>{metrics.total_bookings ?? 0}</p>
        </div>

        <div className="dashboard-card">
          <h2>Available Vehicles</h2>
          <p>{metrics.active_vehicles ?? 0}</p>
        </div>

        <div className="dashboard-card">
          <h2>Total Vehicles</h2>
          <p>{metrics.total_vehicles ?? 0}</p>
        </div>
      </section>

      <section className="dashboard-map">
        <h2>Routes Map</h2>

        <div className="map-placeholder">
          <p>Map will be displayed here</p>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="dashboard-card">
          <h2>Recent Trips</h2>

          {recentTrips.length === 0 ? (
            <p>No recent trips.</p>
          ) : (
            <div className="dashboard-list">
              {recentTrips.map((trip, index) => (
                <div
                  className="dashboard-list-item"
                  key={trip.id ?? trip.trip_id ?? index}
                >
                  <div>
                    <strong>
                      {trip.route_name ||
                        trip.route?.name ||
                        trip.route ||
                        "Route"}
                    </strong>

                    <p>
                      {trip.vehicle?.registration_number ||
                        trip.vehicle_registration ||
                        trip.vehicle ||
                        "Vehicle"}
                    </p>
                  </div>

                  <span>
                    {trip.status || "Scheduled"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Recent Bookings</h2>

          {recentBookings.length === 0 ? (
            <p>No recent bookings.</p>
          ) : (
            <div className="dashboard-list">
              {recentBookings.map((booking, index) => (
                <div
                  className="dashboard-list-item"
                  key={booking.id ?? booking.booking_id ?? index}
                >
                  <div>
                    <strong>
                      {booking.passenger_name ||
                        booking.passenger?.name ||
                        booking.user?.name ||
                        "Passenger"}
                    </strong>

                    <p>
                      {booking.route_name ||
                        booking.route?.name ||
                        booking.route ||
                        "Route"}
                    </p>
                  </div>

                  <span>
                    {booking.status || "Confirmed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default DashboardSummary;