import { useState } from "react";
import Modal from "../Modal";
import { API_BASE_URL } from "../../api/client";
import { getAccessToken } from "../../utils/auth";

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

    const token = getAccessToken() || localStorage.getItem("access_token");

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
    <Modal
      title={isEditing ? "Edit Stop" : "Add New Stop"}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        {error && (
          <p className="modal-error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-field">
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

        <div className="modal-field">
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
          <span className="modal-field-hint">Valid range: -90 to 90</span>
        </div>

        <div className="modal-field">
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
          <span className="modal-field-hint">Valid range: -180 to 180</span>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="modal-submit"
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
    </Modal>
  );
}

export default AddStopModal;
