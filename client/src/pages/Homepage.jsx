import { Component } from "react";
import { Outlet } from "react-router-dom";
import BookingNavbar from "../components/bookings/BookingNavbar.jsx";
import "../styles/homepage.css";

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page error caught by RouteErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#374151" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            Something went wrong loading this section
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1.25rem" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              backgroundColor: "#1a73e8",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Homepage() {
  return (
    <div className="booking-homepage">
      <BookingNavbar />
      <header className="booking-homepage__header">
        <span className="booking-homepage__brand">HopOn</span>
      </header>
      <main className="booking-homepage__content">
        <RouteErrorBoundary>
          <Outlet />
        </RouteErrorBoundary>
      </main>
    </div>
  );
}