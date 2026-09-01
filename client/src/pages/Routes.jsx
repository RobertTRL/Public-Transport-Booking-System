import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import RouteCard from "../components/RouteCard";
import AddRouteModal from "../components/dashboard/AddRouteModal";

const API_BASE_URL = "http://127.0.0.1:5000";

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
  const token = localStorage.getItem("access_token");

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
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
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
<> <div className="dashboard-header routes-header"> <div> <h1>Routes</h1> <p>Select a route to view its vehicles.</p> </div>


    <button
      type="button"
      className="add-route-button"
      onClick={() => setModalOpen(true)}
    >
      <Plus size={16} />
      Add Route
    </button>
  </div>

  <div className="vehicles-toolbar">
    <div className="vehicle-search">
      <Search
        size={16}
        className="vehicle-search-icon"
      />

      <input
        type="text"
        placeholder="Search routes by name"
        value={searchTerm}
        onChange={(event) =>
          setSearchTerm(event.target.value)
        }
      />
    </div>

    <input
      type="text"
      placeholder="Filter by color (exact)"
      value={colorFilter}
      onChange={(event) =>
        setColorFilter(event.target.value)
      }
    />
  </div>

  {error && (
    <p className="vehicle-table-error">
      {error}
    </p>
  )}

  {loading ? (
    <p>Loading routes...</p>
  ) : routeList.length === 0 ? (
    <p>No routes found.</p>
  ) : (
    <section className="routes-grid">
      {routeList.map((route) => (
        <RouteCard
          key={route.id}
          route={route}
        />
      ))}
    </section>
  )}

  {modalOpen && (
    <AddRouteModal
      onClose={() => setModalOpen(false)}
      onCreated={handleAddRoute}
    />
  )}
</>


);
}

export default Routes;
