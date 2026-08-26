import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { routes, getVehiclesByRoute } from "../../data/routesData";
import "../../styles/Vehicle.css";

function RouteDetail() {
  const { routeName } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const decodedName = decodeURIComponent(routeName);
  const route = routes.find((item) => item.name === decodedName);
  const routeVehicles = getVehiclesByRoute(decodedName);

  const totalCapacity = routeVehicles.reduce(
    (sum, vehicle) => sum + vehicle.capacity,
    0
  );

  const filteredVehicles = routeVehicles.filter((vehicle) =>
    vehicle.numberPlate.toLowerCase().includes(query.toLowerCase())
  );

  if (!route) {
    return (
      <div className="route-not-found">
        <h1>Route not found</h1>
        <p>No route matches "{decodedName}".</p>
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
          <p>{route.description}</p>
        </div>

        <span
          className="route-color-dot route-color-dot-lg"
          style={{ background: route.color }}
        />
      </div>

      <section className="dashboard-content route-stats">
        <div className="dashboard-card">
          <h2>Vehicles on route</h2>
          <p>{routeVehicles.length}</p>
        </div>

        <div className="dashboard-card">
          <h2>Total capacity</h2>
          <p>{totalCapacity}</p>
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
                <th>Route</th>
                <th>Capacity</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.numberPlate}>
                    <td>{vehicle.numberPlate}</td>
                    <td>{vehicle.route}</td>
                    <td>{vehicle.capacity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="vehicle-table-empty">
                    No vehicles found.
                  </td>
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
