// hooks/useBookings.js
import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../api/client";

const DEFAULT_PER_PAGE = 10;

export function useBookings() {
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
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/v1/me/bookings?page=${page}&per_page=${perPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

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

      setData(json.bookings ?? json.data ?? []);
      setTotalPages(json.total_pages ?? json.totalPages ?? 1);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    perPage,
    setPerPage,
    totalPages,
  };
}