import { useBookings } from "../../hooks/useBookings";
import BookingCard from "./BookingCard";
import Pagination from "./Pagination";
import "../../styles/homepage.css";

function isNotFoundError(error) {
  if (!error) return false;
  return /404|not found/i.test(error);
}

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
        <p className="activity-empty__text">Loading…</p>
      </div>
    );
  }

  const showEmptyState = !data.length || isNotFoundError(error);

  if (showEmptyState) {
    return (
      <div className="activity-empty">
        <img
          src="/images/Bus Stop-cuate.svg"
          alt="No activity"
          className="activity-empty__image"
        />
        <p className="activity-empty__text">
          No activity, give this space some love!
        </p>
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
