import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setTokens } from "../utils/auth";
import "../styles/auth.css";

const USER_TYPES = [
  {
    key: "passenger",
    label: "Passenger",
    title: "Welcome back",
    description: "Sign in to book your next ride",
  },
  {
    key: "operator",
    label: "Operator",
    title: "Welcome back",
    description: "Sign in to your Public Transport account",
  },
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState("passenger");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const config = USER_TYPES.find((item) => item.key === userType) || USER_TYPES[0];
  const redirectError = location.state?.error;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ 
          "user_type": userType === "operator" ? "user" : userType,
          "email": email,
          "password": password
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Login failed (${response.status})`);
      }

      const data = await response.json().catch(() => ({}));

      const token =
        data.access_token ||
        data.token ||
        data.accessToken ||
        (typeof data === "string" ? data : null);

      if (!token) {
        throw new Error("No access token returned from server.");
      }

      setTokens({
        access_token: data.access_token || token,
        refresh_token: data.refresh_token,
      });

      if (userType === "operator") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>

        <div className="auth-user-type">
          {USER_TYPES.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`auth-user-type__button${
                userType === item.key ? " is-active" : ""
              }`}
              onClick={() => {
                setUserType(item.key);
                setError("");
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {redirectError && <p className="auth-error">{redirectError}</p>}
        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>

              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
