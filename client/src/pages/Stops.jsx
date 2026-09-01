import { useCallback, useEffect, useState } from "react";
import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import "../../styles/dashboard.css";
import AddStopModal from "./AddStopModal";

const API_BASE_URL = "http://localhost:5000";

function Stops() {
const [stopList, setStopList] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [modalOpen, setModalOpen] = useState(false);
const [editingStop, setEditingStop] = useState(null);
const [busyId, setBusyId] = useState(null);

const loadStops = useCallback(async () => {
try {
const token = localStorage.getItem("access_token");


  const response = await fetch(
    `${API_BASE_URL}/api/v1/provider/stops`,
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

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Failed to fetch stops. Status: ${response.status}`
    );
  }

  return {
    stops: Array.isArray(data)
      ? data
      : data.items || data.stops || [],
    error: "",
  };
} catch (err) {
  return {
    stops: [],
    error: err.message || "Failed to fetch stops.",
  };
}


}, []);

useEffect(() => {
let cancelled = false;


const fetchStops = async () => {
  const result = await loadStops();

  if (cancelled) return;

  setStopList(result.stops);
  setError(result.error);
  setLoading(false);
};

fetchStops();

return () => {
  cancelled = true;
};


}, [loadStops]);

const handleSaved = async () => {
setModalOpen(false);
setEditingStop(null);


setLoading(true);
setError("");

const result = await loadStops();

setStopList(result.stops);
setError(result.error);
setLoading(false);


};

const handleRemove = async (stop) => {
if (!window.confirm(`Remove ${stop.name}?`)) {
return;
}


setBusyId(stop.id);
setError("");

try {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/provider/stops/${stop.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Failed to remove stop. Status: ${response.status}`
    );
  }

  setStopList((list) =>
    list.filter((item) => item.id !== stop.id)
  );
} catch (err) {
  setError(err.message || "Failed to remove stop.");
} finally {
  setBusyId(null);
}


};

return (
<> <div className="dashboard-header stops-header"> <div> <h1>Stops</h1> <p>View and manage public transport stops.</p> </div>


    <button
      type="button"
      className="add-stop-button"
      onClick={() => {
        setEditingStop(null);
        setModalOpen(true);
      }}
    >
      <Plus size={16} />
      Add Stop
    </button>
  </div>

  {error && (
    <p className="vehicle-table-error">
      {error}
    </p>
  )}

  <section className="stops-section">
    {loading ? (
      <p>Loading stops...</p>
    ) : stopList.length === 0 ? (
      <p>No stops yet.</p>
    ) : (
      <div className="stops-grid">
        {stopList.map((stop) => (
          <article
            className="stop-card"
            key={stop.id}
          >
            <div className="stop-card-top">
              <div className="stop-icon">
                <MapPin size={20} />
              </div>
            </div>

            <h2>{stop.name}</h2>

            <div className="stop-details">
              <div className="stop-detail">
                <span className="stop-detail-label">
                  Latitude
                </span>

                <span className="stop-detail-value">
                  {stop.latitude}
                </span>
              </div>

              <div className="stop-detail">
                <span className="stop-detail-label">
                  Longitude
                </span>

                <span className="stop-detail-value">
                  {stop.longitude}
                </span>
              </div>
            </div>

            <div className="stop-actions">
              <button
                type="button"
                className="edit-stop-button"
                disabled={busyId === stop.id}
                onClick={() => {
                  setEditingStop(stop);
                  setModalOpen(true);
                }}
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                className="remove-stop-button"
                disabled={busyId === stop.id}
                onClick={() => handleRemove(stop)}
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>

  {modalOpen && (
    <AddStopModal
      stop={editingStop}
      onClose={() => {
        setModalOpen(false);
        setEditingStop(null);
      }}
      onCreated={handleSaved}
    />
  )}
</>


);
}

export default Stops;
