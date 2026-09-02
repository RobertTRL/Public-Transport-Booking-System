import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import RouteCard from "./RouteCard";
import AddRouteModal from "./AddRouteModal";
import { API_BASE_URL } from "../../api/client";
import { getAccessToken } from "../../utils/auth";

function Routes() {
  const [routeList, setRouteList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAccessToken() || localStorage.getItem("access_token");
      const params = new URLSearchParams({
        per_page: "50",
      });

      if (searchTerm) {
        params.append("q", searchTerm);
      }

      if (colorFilter) {
        params.append("color", colorFilter);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/provider/routes?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to fetch routes. Status: ${response.status}`
        );
      }

      setRouteList(
        Array.isArray(data)
          ? data
          : data.items || data.routes || []
      );
    } catch (err) {
      setError(err.message || "Failed to fetch routes.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, colorFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(loadRoutes, 300);
    return () => clearTimeout(timeoutId);
  }, [loadRoutes]);

  const handleAddRoute = () => {
    loadRoutes();
  };

  return (
    <>
      <div className="dashboard-header routes-header">
        <div>
          <h1>Routes</h1>
          <p>Select a route to view its vehicles.</p>
        </div>

        <button
          type="button"
          className="add-route-button"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Add Route
        </button>
      </div>

      <div className="routes-toolbar">
        <div className="routes-search-box">
          <Search size={16} className="routes-search-icon" />

          <input
            type="text"
            className="routes-search-input"
            placeholder="Search routes by name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <select
          className="routes-filter-select"
          value={colorFilter}
          onChange={(event) => setColorFilter(event.target.value)}
        >
          <option value="">All colors</option>
          <option value="#2563eb">Blue</option>
          <option value="#16a34a">Green</option>
          <option value="#dc2626">Red</option>
          <option value="#9333ea">Purple</option>
          <option value="#f59e0b">Orange</option>
        </select>
      </div>

      {error && <p className="vehicle-table-error">{error}</p>}

      {loading ? (
        <div className="routes-loading-state">
          <p>Loading routes...</p>
        </div>
      ) : routeList.length === 0 ? (
        <div className="routes-empty-state">
          <p>No routes found matching your criteria.</p>
        </div>
      ) : (
        <section className="routes-grid">
          {routeList.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </section>
      )}

      {modalOpen && (
        <AddRouteModal
          onClose={() => setModalOpen(false)}
          onCreated={handleAddRoute}
          onSuccess={handleAddRoute}
        />
      )}
    </>
  );
}

export default Routes;
