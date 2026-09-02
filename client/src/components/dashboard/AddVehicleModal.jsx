import { useState } from "react";
import Modal from "../Modal";
import { API_BASE_URL } from "../../api/client";

function AddVehicleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    number_plate: "",
    capacity: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You are not authenticated. Please log in again.");
      setSubmitting(false);
      return;
    }

    const payload = {
      number_plate: form.number_plate.trim(),
      capacity: form.capacity === "" ? 0 : Number(form.capacity),
      is_active: form.is_active,
    };

    if (!payload.number_plate) {
      setError("Number plate is required.");
      setSubmitting(false);
      return;
    }

    if (!Number.isFinite(payload.capacity) || payload.capacity < 1) {
      setError("Capacity must be at least 1.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/provider/vehicles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
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
          data.message ||
            data.error ||
            "Failed to create vehicle."
        );
      }

      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add Vehicle" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <p className="modal-error">{error}</p>}

        <div className="modal-field">
          <label htmlFor="vehicle-plate">Number plate</label>
          <input
            id="vehicle-plate"
            name="number_plate"
            value={form.number_plate}
            onChange={handleChange}
            placeholder="KXX 123A"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="vehicle-capacity">Capacity</label>
          <input
            id="vehicle-capacity"
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={handleChange}
            placeholder="33"
            required
          />
        </div>

        <div className="modal-field modal-field-checkbox">
          <label htmlFor="vehicle-active">
            <input
              id="vehicle-active"
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="modal-submit"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddVehicleModal;
