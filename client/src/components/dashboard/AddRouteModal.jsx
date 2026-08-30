import { useState } from "react";
import Modal from "../Modal";
import { createRoute } from "../../api/mockApi";

const PRESET_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b"];

function AddRouteModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: PRESET_COLORS[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const created = await createRoute(form);
    setSubmitting(false);
    onCreated(created.route ?? form);
    onClose();
  };

  return (
    <Modal title="Add Route" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="route-name">Route name</label>
          <input
            id="route-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Route A"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="route-description">Description</label>
          <input
            id="route-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="CBD – Karen loop via Ngong Road"
          />
        </div>

        <div className="modal-field">
          <label>Route color</label>
          <div className="modal-color-row">
            {PRESET_COLORS.map((color) => (
              <button
                type="button"
                key={color}
                className={`modal-color-swatch${
                  form.color === color ? " is-selected" : ""
                }`}
                style={{ background: color }}
                aria-label={`Select color ${color}`}
                onClick={() => setForm((f) => ({ ...f, color }))}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add Route"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddRouteModal;
