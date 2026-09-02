import { Link } from "react-router-dom";

const RouteCard = ({ route }) => {
  const { id, name, color_code, color, description, assigned_vehicles_count, total_vehicles } = route;

  const badgeColor = color_code || color || "#2563eb";
  const vehicleCount = assigned_vehicles_count ?? total_vehicles ?? 0;

  return (
    <article className="route-card-item">
      <div className="route-card-main">
        <div className="route-card-topbar">
          <h3 className="route-card-name">{name}</h3>
          <span
            className="route-card-pill"
            style={{ backgroundColor: badgeColor }}
          >
            Route #{id}
          </span>
        </div>

        <p className="route-card-description">
          {description || "No description provided for this route."}
        </p>
      </div>

      <div className="route-card-bottom">
        <span className="route-card-vehicles-tag">
          🚍 {vehicleCount} {vehicleCount === 1 ? "Vehicle" : "Vehicles"}
        </span>

        <Link
          to={`/dashboard/routes/${id}`}
          className="route-card-action-link"
        >
          View Details →
        </Link>
      </div>
    </article>
  );
};

export default RouteCard;
