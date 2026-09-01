import { useState } from "react";
import Modal from "../Modal";
import { createUser } from "../../api/mockApi";

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Driver",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const created = await createUser(form);
    setSubmitting(false);
    onCreated(created.user ?? form);
    onClose();
  };

  return (
    <Modal title="Add User" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="user-name">Full name</label>
          <input
            id="user-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Kamau"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="user-email">Email</label>
          <input
            id="user-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@hopon.co.ke"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="user-phone">Phone number</label>
          <input
            id="user-phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+254 712 345 678"
          />
        </div>

        <div className="modal-field">
          <label htmlFor="user-role">Role</label>
          <select
            id="user-role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="Manager">Manager</option>
            <option value="Driver">Driver</option>
            <option value="Conductor">Conductor</option>
          </select>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-submit" disabled={submitting}>
            {submitting ? "Saving..." : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddUserModal;
