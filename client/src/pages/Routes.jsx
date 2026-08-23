import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Routes.css";

const vehicles = [
  {
    numberPlate: "KXX 123A",
    route: "Route A",
    capacity: 33,
    availability: "Available",
  },
  {
    numberPlate: "KYY 456B",
    route: "Route B",
    capacity: 45,
    availability: "Unavailable",
  },
  {
    numberPlate: "KZZ 789C",
    route: "Route C",
    capacity: 28,
    availability: "Available",
  },
  {
    numberPlate: "KAA 321D",
    route: "Route A",
    capacity: 50,
    availability: "Available",
  },
];

function Routes() {
  const navigate = useNavigate();

  const routes = useMemo(() => {
    const seen = new Set();
    return vehicles.filter((vehicle) => {
      if (seen.has(vehicle.route)) return false;
      seen.add(vehicle.route);
      return true;
    });
  }, []);

  return (
    <div className="routes-page">
      <div className="dashboard-header">
        <h1>Routes</h1>
        <p>Select a route to view its vehicles.</p>
      </div>

      <section className="routes-content">
        <div className="routes-grid">
          {routes.map((route) => (
            <div
              key={route.route}
              className="route-card"
              onClick={() => navigate(`/dashboard/route/${route.route}`)}
            >
              <div className="route-card-image">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(route.route)}/400/400`}
                  alt={route.route}
                />
              </div>
              <div className="route-card-body">
                <h3>{route.route}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Routes;
