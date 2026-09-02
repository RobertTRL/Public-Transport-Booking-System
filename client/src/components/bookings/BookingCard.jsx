function formatDateTime(value) {
  if (!value) return "Upcoming trip";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Upcoming trip";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function BookingCard({ booking }) {
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
        <span className={`booking-card__badge is-${booking.status || "active"}`}>
          {booking.status ?? "Confirmed"}
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
    </article>
  );
}

export default BookingCard;