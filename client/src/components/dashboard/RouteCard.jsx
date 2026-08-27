import { useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import { routeImage, getVehiclesByRoute } from "../../data/routesData";

function RouteCard({ route }) {
  const navigate = useNavigate();
  const vehicleCount = getVehiclesByRoute(route.name).length;

  const openRoute = () => {
    navigate(`/dashboard/routes/${encodeURIComponent(route.name)}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openRoute();
    }
  };

  return (
    <article
      className="route-card"
      role="button"
      tabIndex={0}
      onClick={openRoute}
      onKeyDown={handleKeyDown}
    >
      <div className="route-card-image">
        <img
          src={routeImage(route)}
          alt={route.name}
          width={400}
          height={400}
        />
      </div>

      <div className="route-card-body">
        <div className="route-card-heading">
          <span
            className="route-color-dot"
            style={{ background: route.color }}
          />
          <h3>{route.name}</h3>
        </div>

        <p>{route.description}</p>

        <span className="route-vehicle-count">
          <Bus size={14} />
          {vehicleCount} {vehicleCount === 1 ? "vehicle" : "vehicles"}
        </span>
      </div>
    </article>
  );
}

export default RouteCard;
