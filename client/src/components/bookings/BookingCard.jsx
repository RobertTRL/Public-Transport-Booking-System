import { useState } from "react";
import { API_BASE_URL } from "../../api/client";
import { fetchWithAuth } from "../../utils/auth";

function formatDateTime(value) {
  if (!value) return "Upcoming trip";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Upcoming trip";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function BookingCard({ booking, onCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const [localStatus, setLocalStatus] = useState(booking.status || "active");
  const [error, setError] = useState("");

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/bookings/${booking.id}/cancel`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `Failed to cancel (${response.status})`);
      }

      setLocalStatus("cancelled");
      if (onCancelled) {
        onCancelled();
      }
    } catch (err) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };
  const originName =
    booking.origin_routestop?.stop?.name ??
    booking.origin ??
    "Origin";

  const destinationName =
    booking.destination_routestop?.stop?.name ??
    booking.destination ??
    "Destination";

  const vehicle = booking.trip?.vehicle;
  const plateNumber = vehicle?.number_plate ?? booking.number_plate ?? booking.vehicle ?? "—";

  const tripOrigin = booking.trip?.origin_routestop?.stop?.name;
  const tripDestination = booking.trip?.destination_routestop?.stop?.name;
  const departureTime = booking.trip?.start_time ?? booking.date ?? booking.made_at;

  return (
    <article className="booking-card">
      <div className="booking-card__header">
        <div>
          <h3 className="booking-card__title">
            {originName} → {destinationName}
          </h3>
          <p className="booking-card__sub">
            {formatDateTime(departureTime)}
          </p>
        </div>
        <span className={`booking-card__badge is-${localStatus}`}>
          {localStatus === "cancelled" ? "Cancelled" : "Confirmed"}
        </span>
      </div>

      <div className="booking-card__details">
        <div className="booking-card__detail">
          <span className="booking-card__label">Vehicle</span>
          <span className="booking-card__value">
            {plateNumber}
          </span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Route</span>
          <span className="booking-card__value">
            {tripOrigin && tripDestination
              ? `${tripOrigin} → ${tripDestination}`
              : "—"}
          </span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Vehicle capacity</span>
          <span className="booking-card__value">
            {vehicle?.capacity ?? "—"}
          </span>
        </div>
      </div>

      {error && <p className="booking-card__error">{error}</p>}

      {localStatus !== "cancelled" && (
        <div className="booking-card__actions">
          <button
            type="button"
            className="booking-card__cancel-btn"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      )}
    </article>
  );
}

export default BookingCard;