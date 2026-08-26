import RouteCard from "./RouteCard";
import { routes } from "../../data/routesData";

function Routes() {
  return (
    <>
      <div className="dashboard-header">
        <h1>Routes</h1>
        <p>Select a route to view its vehicles.</p>
      </div>

      <section className="routes-grid">
        {routes.map((route) => (
          <RouteCard key={route.name} route={route} />
        ))}
      </section>
    </>
  );
}

export default Routes;
