import { useState, useEffect } from "react";

const DEFAULT_PER_PAGE = 10;

export function useBookings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
        });

        const response = await fetch(`/api/v1/me/bookings?${params}`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const json = await response.json();

        const items = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
            ? json.data
            : [];

        const total =
          typeof json?.meta?.total === "number"
            ? json.meta.total
            : items.length;

        const totalPages =
          typeof json?.meta?.total_pages === "number"
            ? json.meta.total_pages
            : Math.max(1, Math.ceil(total / perPage));

        if (!cancelled) {
          setData(items);
          setMeta({ total, totalPages });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
          setMeta({ total: 0, totalPages: 1 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [page, perPage]);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    perPage,
    setPerPage,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}