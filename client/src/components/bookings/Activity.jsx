import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { fetchWithAuth } from "../../utils/auth";
import BookingCard from "./BookingCard";
import Pagination from "./Pagination";
import "../../styles/homepage.css";

const DEFAULT_PER_PAGE = 10;

function isNotFoundError(error) {
  if (!error) return false;
  return /404|not found/i.test(error);
}

function Activity() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/me/bookings?page=${page}&per_page=${perPage}`
      );

      if (res.status === 401) {
        navigate("/login", {
          state: { error: "Please sign in to view your bookings." },
        });
        return;
      }

      if (res.status === 404) {
        setData([]);
        setTotalPages(1);
        setError("404 Not Found");
        return;
      }

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const json = await res.json();

      setData(Array.isArray(json.items) ? json.items : []);
      setTotalPages(
        typeof json.total_pages === "number" ? json.total_pages : 1
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, navigate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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
          <BookingCard
            key={booking.id ?? `${booking.origin}-${booking.destination}`}
            booking={booking}
          />
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