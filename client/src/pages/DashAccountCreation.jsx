import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

function DashAccountCreation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "driver",
    sacco_id: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.sacco_id) {
      setError("Please enter a SACCO ID.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/v1/auth/provider/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            sacco_id: Number(formData.sacco_id),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Account creation failed."
        );
      }

      if (!data.access_token) {
        throw new Error(
          "Account created, but no access token was returned."
        );
      }

      localStorage.setItem("access_token", data.access_token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Provider registration failed:", err);
      setError(err.message || "Unable to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Create your operator account</h1>
          <p>Set up your account to manage routes and services</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">
              Confirm password
            </label>

            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sacco_id">SACCO ID</label>

            <input
              id="sacco_id"
              name="sacco_id"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={formData.sacco_id}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/dashlogin">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default DashAccountCreation;