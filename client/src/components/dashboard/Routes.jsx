import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import RouteCard from "../components/dashboard/RouteCard";
import AddRouteModal from "../components/dashboard/AddRouteModal";
import { listRoutes } from "../api/providerClient";
import "../styles/dashboard.css";

function Routes() {
const [routeList, setRouteList] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [modalOpen, setModalOpen] = useState(false);

const loadRoutes = useCallback(async () => {
setLoading(true);
setError("");


try {
  const data = await listRoutes({ per_page: 50 });

  setRouteList(data?.items || data?.routes || []);
} catch (err) {
  setError(err?.message || "Failed to load routes.");
} finally {
  setLoading(false);
}


}, []);

useEffect(() => {
let cancelled = false;


const fetchRoutes = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await listRoutes({ per_page: 50 });

    if (!cancelled) {
      setRouteList(data?.items || data?.routes || []);
    }
  } catch (err) {
    if (!cancelled) {
      setError(err?.message || "Failed to load routes.");
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
};

fetchRoutes();

return () => {
  cancelled = true;
};


}, []);

const handleAddRoute = () => {
setModalOpen(false);
loadRoutes();
};

return ( <div className="routes-page"> <div className="dashboard-header"> <div> <h1>Routes</h1> <p>Select a route to view its vehicles.</p> </div>


    <button
      type="button"
      className="add-route-button"
      onClick={() => setModalOpen(true)}
    >
      <Plus size={16} />
      Add Route
    </button>
  </div>

  {error && <p className="route-table-error">{error}</p>}

  <section className="routes-grid">
    {loading ? (
      <p>Loading routes...</p>
    ) : routeList.length > 0 ? (
      routeList.map((route) => (
        <RouteCard key={route.id} route={route} />
      ))
    ) : (
      <p>No routes found.</p>
    )}
  </section>

  {modalOpen && (
    <AddRouteModal
      onClose={() => setModalOpen(false)}
      onSuccess={handleAddRoute}
    />
  )}
</div>


);
}

export default Routes;
