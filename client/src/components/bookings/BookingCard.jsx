function BookingCard({ booking }) {
  return (
    <article className="booking-card">
      <div className="booking-card__header">
        <div>
          <h3 className="booking-card__title">
            {booking.origin ?? "Origin"} → {booking.destination ?? "Destination"}
          </h3>
          <p className="booking-card__sub">
            {booking.date ?? booking.start_time ?? "Upcoming trip"}
          </p>
        </div>
        <span className="booking-card__badge">
          {booking.status ?? "Confirmed"}
        </span>
      </div>

      <div className="booking-card__details">
        <div className="booking-card__detail">
          <span className="booking-card__label">Vehicle</span>
          <span className="booking-card__value">
            {booking.vehicle ?? booking.number_plate ?? "—"}
          </span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Route</span>
          <span className="booking-card__value">
            {booking.route ?? "—"}
          </span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Seats</span>
          <span className="booking-card__value">
            {booking.seats ?? booking.capacity ?? "—"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default BookingCard;
