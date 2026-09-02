import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";
import Map from "../maprelated/Map";
import { allStops } from "../../data/nairobiRoutes";

function DashboardSummary() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stops, setStops] = useState(allStops);

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

    async function loadStops() {
      try {
        const stopsData = await apiGet("/api/v1/provider/stops");
        if (cancelled) return;

        const rawList = Array.isArray(stopsData)
          ? stopsData
          : stopsData.items || stopsData.stops || [];

        const formatted = rawList
          .filter((s) => s.latitude && s.longitude)
          .map((s) => ({
            id: String(s.id),
            name: s.name,
            position: [Number(s.latitude), Number(s.longitude)],
          }));

        if (formatted.length > 0) {
          setStops(formatted);
        }
      } catch {
        // Fallback to allStops
      }
    }

    loadDashboard();
    loadStops();

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

        <div className="dashboard-map-wrapper">
          <Map stops={stops} />
        </div>
      </section>
    </>
  );
}

export default DashboardSummary;