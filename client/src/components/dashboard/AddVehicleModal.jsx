import { useState } from "react";
import Modal from "../Modal";
import { createVehicle } from "../../api/mockApi";

function AddVehicleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    numberPlate: "",
    route: "",
    capacity: "",
    availability: "Available",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      capacity: form.capacity === "" ? 0 : Number(form.capacity),
    };
    const created = await createVehicle(payload);
    setSubmitting(false);
    onCreated(created.vehicle ?? payload);
    onClose();
  };

  return (
    <Modal title="Add Vehicle" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="vehicle-plate">Number plate</label>
          <input
            id="vehicle-plate"
            name="numberPlate"
            value={form.numberPlate}
            onChange={handleChange}
            placeholder="KXX 123A"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="vehicle-route">Route</label>
          <input
            id="vehicle-route"
            name="route"
            value={form.route}
            onChange={handleChange}
            placeholder="Route A"
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

        <div className="modal-field">
          <label htmlFor="vehicle-availability">Availability</label>
          <select
            id="vehicle-availability"
            name="availability"
            value={form.availability}
            onChange={handleChange}
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddVehicleModal;
