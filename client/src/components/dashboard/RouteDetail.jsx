import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
ArrowLeft,
Bus,
Calendar,
MapPin,
RefreshCw,
Users,
} from "lucide-react";
import "../../styles/dashboard.css";

const API_BASE_URL = "http://127.0.0.1:5000";

function getAuthHeaders() {
const token = localStorage.getItem("access_token");

return {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
};
}

async function request(url, options = {}) {
const response = await fetch(`${API_BASE_URL}${url}`, {
...options,
headers: {
...getAuthHeaders(),
...(options.headers || {}),
},
});

let data = {};

try {
data = await response.json();
} catch {
// Response has no JSON body.
}

if (!response.ok) {
throw new Error(
data?.message ||
data?.error ||
`Request failed with status ${response.status}`
);
}

return data;
}

async function getRoute(routeId) {
return request(`/api/v1/provider/routes/${routeId}`);
}

async function listRouteTrips(routeId, params = {}) {
const query = new URLSearchParams(params).toString();

return request(
`/api/v1/provider/routes/${routeId}/trips${query ? `?${query}` : ""}`
);
}

function RouteDetail() {
const { routeName } = useParams();

const [route, setRoute] = useState(null);
const [trips, setTrips] = useState([]);
const [loading, setLoading] = useState(true);
const [loadingTrips, setLoadingTrips] = useState(false);
const [error, setError] = useState("");

const loadRoute = useCallback(async () => {
try {
const decodedRouteName = decodeURIComponent(routeName || "");
const data = await getRoute(decodedRouteName);


  return {
    success: true,
    data: data?.route || data,
  };
} catch (err) {
  return {
    success: false,
    error: err.message || "Failed to load route.",
  };
}


}, [routeName]);

const loadTrips = useCallback(async (routeId) => {
if (!routeId) {
return {
success: true,
data: [],
};
}


try {
  const data = await listRouteTrips(routeId);

  return {
    success: true,
    data: Array.isArray(data)
      ? data
      : data?.items || data?.trips || [],
  };
} catch (err) {
  return {
    success: false,
    error: err.message || "Failed to load route trips.",
  };
}


}, []);

useEffect(() => {
let cancelled = false;

const loadData = async () => {
  setLoading(true);
  setError("");

  const routeResult = await loadRoute();

  if (cancelled) {
    return;
  }

  if (!routeResult.success) {
    setError(routeResult.error);
    setRoute(null);
    setLoading(false);
    return;
  }

  setRoute(routeResult.data);
  setLoading(false);
};

loadData();

return () => {
  cancelled = true;
};


}, [loadRoute]);

useEffect(() => {
if (!route?.id) {
return;
}


let cancelled = false;

const loadData = async () => {
  setLoadingTrips(true);

  const tripsResult = await loadTrips(route.id);

  if (cancelled) {
    return;
  }

  if (!tripsResult.success) {
    setError(tripsResult.error);
    setTrips([]);
  } else {
    setTrips(tripsResult.data);
  }

  setLoadingTrips(false);
};

loadData();

return () => {
  cancelled = true;
};


}, [route, loadTrips]);

const handleRefresh = async () => {
setLoading(true);
setError("");


const routeResult = await loadRoute();

if (!routeResult.success) {
  setError(routeResult.error);
  setRoute(null);
  setLoading(false);
  return;
}

setRoute(routeResult.data);
setLoading(false);


};

if (loading) {
return ( <section className="dashboard-section"> <p>Loading route...</p> </section>
);
}

if (error && !route) {
return ( <section className="dashboard-section"> <div className="dashboard-header"> <div> <h1>Route Details</h1> <p>Unable to load this route.</p> </div> </div>

```
    <p className="vehicle-table-error">{error}</p>

    <Link to="/dashboard/routes" className="dashboard-back-link">
      <ArrowLeft size={16} />
      Back to Routes
    </Link>
  </section>
);


}

return ( <main className="dashboard-section"> <div className="dashboard-header"> <div> <Link to="/dashboard/routes" className="dashboard-back-link"> <ArrowLeft size={16} />
Back to Routes </Link>


      <h1>{route?.name || "Route Details"}</h1>

      <p>
        View route information, trips and transport details.
      </p>
    </div>

    <button
      type="button"
      className="add-stop-button"
      onClick={handleRefresh}
      disabled={loading}
    >
      <RefreshCw size={16} />
      Refresh
    </button>
  </div>

  {error && (
    <p className="vehicle-table-error">
      {error}
    </p>
  )}

  <section className="stops-section">
    <div className="stops-grid">
      <article className="stop-card">
        <div className="stop-card-top">
          <div className="stop-icon">
            <MapPin size={20} />
          </div>
        </div>

        <h2>Route</h2>

        <div className="stop-details">
          <div className="stop-detail">
            <span className="stop-detail-label">
              Route name
            </span>

            <span className="stop-detail-value">
              {route?.name || "—"}
            </span>
          </div>

          <div className="stop-detail">
            <span className="stop-detail-label">
              Route ID
            </span>

            <span className="stop-detail-value">
              {route?.id ?? "—"}
            </span>
          </div>
        </div>
      </article>

      <article className="stop-card">
        <div className="stop-card-top">
          <div className="stop-icon">
            <Bus size={20} />
          </div>
        </div>

        <h2>Transport</h2>

        <div className="stop-details">
          <div className="stop-detail">
            <span className="stop-detail-label">
              Vehicles
            </span>

            <span className="stop-detail-value">
              {route?.vehicle_count ??
                route?.vehicles?.length ??
                "—"}
            </span>
          </div>

          <div className="stop-detail">
            <span className="stop-detail-label">
              Stops
            </span>

            <span className="stop-detail-value">
              {route?.stop_count ??
                route?.stops?.length ??
                "—"}
            </span>
          </div>
        </div>
      </article>

      <article className="stop-card">
        <div className="stop-card-top">
          <div className="stop-icon">
            <Calendar size={20} />
          </div>
        </div>

        <h2>Trips</h2>

        <div className="stop-details">
          <div className="stop-detail">
            <span className="stop-detail-label">
              Total trips
            </span>

            <span className="stop-detail-value">
              {trips.length}
            </span>
          </div>

          <div className="stop-detail">
            <span className="stop-detail-label">
              Status
            </span>

            <span className="stop-detail-value">
              Active
            </span>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section className="stops-section">
    <div className="dashboard-header">
      <div>
        <h2>Route Trips</h2>
        <p>
          Trips currently associated with this route.
        </p>
      </div>
    </div>

    {loadingTrips ? (
      <p>Loading trips...</p>
    ) : trips.length === 0 ? (
      <p>No trips found for this route.</p>
    ) : (
      <div className="stops-grid">
        {trips.map((trip) => (
          <article
            className="stop-card"
            key={trip.id}
          >
            <div className="stop-card-top">
              <div className="stop-icon">
                <Calendar size={20} />
              </div>
            </div>

            <h2>
              Trip #{trip.id}
            </h2>

            <div className="stop-details">
              <div className="stop-detail">
                <span className="stop-detail-label">
                  Date
                </span>

                <span className="stop-detail-value">
                  {trip.date ||
                    trip.travel_date ||
                    trip.trip_date ||
                    "—"}
                </span>
              </div>

              <div className="stop-detail">
                <span className="stop-detail-label">
                  Time
                </span>

                <span className="stop-detail-value">
                  {trip.time ||
                    trip.departure_time ||
                    "—"}
                </span>
              </div>

              <div className="stop-detail">
                <span className="stop-detail-label">
                  Vehicle
                </span>

                <span className="stop-detail-value">
                  {trip.vehicle_id ??
                    trip.vehicle?.id ??
                    "—"}
                </span>
              </div>

              <div className="stop-detail">
                <span className="stop-detail-label">
                  Bookings
                </span>

                <span className="stop-detail-value">
                  {trip.booking_count ??
                    trip.bookings_count ??
                    trip.bookings?.length ??
                    "—"}
                </span>
              </div>
            </div>

            <div className="stop-actions">
              <span className="profile-badge">
                {trip.status || "Scheduled"}
              </span>

              <span className="profile-badge">
                <Users size={14} />
                {trip.capacity ??
                  trip.vehicle?.capacity ??
                  "—"}
              </span>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
</main>


);
}

export default RouteDetail;
