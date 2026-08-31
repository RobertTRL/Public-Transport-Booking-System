import { useState } from "react";
import { Plus } from "lucide-react";
import RouteCard from "./RouteCard";
import AddRouteModal from "./AddRouteModal";
import { routes as seedRoutes } from "../../data/routesData";

function Routes() {
  const [routeList, setRouteList] = useState(seedRoutes);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddRoute = (route) => {
    setRouteList((list) => [
      { id: `route-${Date.now()}`, ...route },
      ...list,
    ]);
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

      <section className="routes-grid">
        {routeList.map((route) => (
          <RouteCard key={route.name} route={route} />
        ))}
      </section>

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
