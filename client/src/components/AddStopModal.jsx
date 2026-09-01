import { useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function AddStopModal({ stop, onClose, onCreated }) {
const isEditing = Boolean(stop);

const [name, setName] = useState(stop?.name || "");
const [latitude, setLatitude] = useState(stop?.latitude ?? "");
const [longitude, setLongitude] = useState(stop?.longitude ?? "");
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (event) => {
event.preventDefault();
setError("");


if (!name.trim() || latitude === "" || longitude === "") {
  setError("Please complete all fields.");
  return;
}

const latitudeNumber = Number(latitude);
const longitudeNumber = Number(longitude);

if (
  Number.isNaN(latitudeNumber) ||
  latitudeNumber < -90 ||
  latitudeNumber > 90
) {
  setError("Latitude must be between -90 and 90.");
  return;
}

if (
  Number.isNaN(longitudeNumber) ||
  longitudeNumber < -180 ||
  longitudeNumber > 180
) {
  setError("Longitude must be between -180 and 180.");
  return;
}

const token = localStorage.getItem("access_token");

if (!token) {
  setError("You are not authenticated. Please log in again.");
  return;
}

const payload = {
  name: name.trim(),
  latitude: latitudeNumber,
  longitude: longitudeNumber,
};

setSaving(true);

try {
  const url = isEditing
    ? `${API_BASE_URL}/api/v1/provider/stops/${stop.id}`
    : `${API_BASE_URL}/api/v1/provider/stops`;

  const response = await fetch(url, {
    method: isEditing ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

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
        `Failed to ${isEditing ? "update" : "create"} stop.`
    );
  }

  onCreated();
  onClose();
} catch (err) {
  setError(err.message || "Failed to save stop.");
} finally {
  setSaving(false);
}


};

return (
<div
className="modal-overlay"
onClick={() => {
if (!saving) onClose();
}}
>
<div
className="modal-content"
onClick={(event) => event.stopPropagation()}
> <div className="modal-header"> <div> <h2>{isEditing ? "Edit Stop" : "Add New Stop"}</h2> <p>
{isEditing
? "Update the stop details."
: "Add a new public transport stop."} </p> </div>


      <button
        type="button"
        className="modal-close"
        onClick={onClose}
        disabled={saving}
      >
        ×
      </button>
    </div>

    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label htmlFor="stop-name">Stop Name</label>
        <input
          id="stop-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. CBD Stage"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="stop-latitude">Latitude</label>
        <input
          id="stop-latitude"
          type="number"
          step="any"
          value={latitude}
          onChange={(event) => setLatitude(event.target.value)}
          placeholder="e.g. -1.286389"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="stop-longitude">Longitude</label>
        <input
          id="stop-longitude"
          type="number"
          step="any"
          value={longitude}
          onChange={(event) => setLongitude(event.target.value)}
          placeholder="e.g. 36.817223"
          required
        />
      </div>

      {error && <p className="modal-error">{error}</p>}

      <div className="modal-actions">
        <button
          type="button"
          className="modal-cancel-button"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="modal-submit-button"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Add Stop"}
        </button>
      </div>
    </form>
  </div>
</div>


);
}

export default AddStopModal;
