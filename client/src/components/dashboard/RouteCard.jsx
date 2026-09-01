import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import { routeImage } from "../../data/routesData";

const API_BASE_URL = "http://127.0.0.1:5000";

function RouteCard({ route }) {
const navigate = useNavigate();
const [vehicleCount, setVehicleCount] = useState(null);

useEffect(() => {
let cancelled = false;


const fetchVehicleCount = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `${API_BASE_URL}/api/v1/provider/vehicles?route_id=${route.id}&per_page=1`,
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

    if (!response.ok) {
      throw new Error("Failed to fetch vehicles.");
    }

    const data = await response.json();

    if (!cancelled) {
      setVehicleCount(data.total ?? 0);
    }
  } catch {
    if (!cancelled) {
      setVehicleCount(0);
    }
  }
};

fetchVehicleCount();

return () => {
  cancelled = true;
};


}, [route.id]);

const openRoute = () => {
navigate(`/dashboard/routes/${route.id}`);
};

const handleKeyDown = (event) => {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
openRoute();
}
};

return ( <article
   className="route-card"
   role="button"
   tabIndex={0}
   onClick={openRoute}
   onKeyDown={handleKeyDown}
 > <div className="route-card-image"> <img
       src={routeImage(route)}
       alt={route.name}
       width={400}
       height={400}
     /> </div>


  <div className="route-card-body">
    <div className="route-card-heading">
      <span
        className="route-color-dot"
        style={{ background: route.color }}
      />
      <h3>{route.name}</h3>
    </div>

    <p>
      {route.total_stops}{" "}
      {route.total_stops === 1 ? "stop" : "stops"}
    </p>

    <span className="route-vehicle-count">
      <Bus size={14} />
      {vehicleCount === null
        ? "..."
        : `${vehicleCount} ${
            vehicleCount === 1 ? "vehicle" : "vehicles"
          }`}
    </span>
  </div>
</article>


);
}

export default RouteCard;
