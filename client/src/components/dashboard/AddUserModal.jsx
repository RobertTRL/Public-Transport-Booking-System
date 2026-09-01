import { useState } from "react";
import Modal from "../Modal";
import { apiPost } from "../../api/client";

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "driver",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const created = await apiPost("/api/v1/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
        role: form.role,
      });

      onCreated(created?.user ?? created);
      onClose();
    } catch (err) {
      setError(err.message || "Unable to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add User" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && (
          <p className="modal-error" role="alert">
            {error}
          </p>
        )}

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
          <label htmlFor="user-password">Temporary password</label>
          <input
            id="user-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="TemporaryPassword123!"
            minLength={8}
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="user-phone">Phone number</label>
          <input
            id="user-phone"
            name="phone_number"
            type="tel"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="+254712345678"
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="user-role">Role</label>
          <select
            id="user-role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="driver">Driver</option>
            <option value="conductor">Conductor</option>
            <option value="manager">Manager</option>
          </select>
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
            {submitting ? "Saving..." : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddUserModal;