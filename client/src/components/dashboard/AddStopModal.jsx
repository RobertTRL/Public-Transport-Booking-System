import { useState } from "react";
import Modal from "../Modal";
import { createStop } from "../../api/mockApi";

function AddStopModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    routes: "",
    status: "Active",
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
      routes: form.routes === "" ? 0 : Number(form.routes),
    };
    const created = await createStop(payload);
    setSubmitting(false);
    onCreated(created.stop ?? payload);
    onClose();
  };

  return (
    <Modal title="Add Stop" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="stop-name">Stop name</label>
          <input
            id="stop-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="CBD Stage"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="stop-description">Description</label>
          <input
            id="stop-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Central bus station"
          />
        </div>

        <div className="modal-field">
          <label htmlFor="stop-location">Location</label>
          <input
            id="stop-location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="KN 4 Ave"
          />
        </div>

        <div className="modal-field">
          <label htmlFor="stop-routes">Routes served</label>
          <input
            id="stop-routes"
            name="routes"
            type="number"
            min="0"
            value={form.routes}
            onChange={handleChange}
            placeholder="6"
          />
        </div>

        <div className="modal-field">
          <label htmlFor="stop-status">Status</label>
          <select
            id="stop-status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add Stop"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddStopModal;
