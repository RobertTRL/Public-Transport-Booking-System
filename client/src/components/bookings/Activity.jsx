import { useBookings } from "../../hooks/useBookings";
import BookingCard from "./BookingCard";
import Pagination from "./Pagination";
import "../../styles/homepage.css";

function Activity() {
  const {
    data,
    loading,
    error,
    page,
    setPage,
    perPage,
    setPerPage,
    totalPages,
  } = useBookings();

  if (loading) {
    return (
      <div className="activity-empty">
        <p className="activity-empty__text">Loading your bookings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-empty">
        <p className="activity-empty__text">
          Something went wrong while loading your bookings.
        </p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="activity-empty">
        <img
          src="/images/Bus Stop-cuate.svg"
          alt="No bookings"
          className="activity-empty__image"
        />
        <p className="activity-empty__text">
          No activity yet — book a ride and it will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <div className="activity-list">
        {data.map((booking) => (
          <BookingCard key={booking.id ?? `${booking.origin}-${booking.destination}`} booking={booking} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
      />
    </div>
  );
}

export default Activity;
