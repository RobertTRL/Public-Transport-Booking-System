import { useState, useEffect, useCallback } from "react";

const DEFAULT_PER_PAGE = 10;

export function useBookings() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
  });

  const fetchBookings = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    try {
      const response = await fetch(`/api/v1/me/bookings?${params}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const json = await response.json();

      const items = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.items)
            ? json.items
            : [];

      const total =
        typeof json?.meta?.total === "number"
          ? json.meta.total
          : typeof json?.total === "number"
            ? json.total
            : items.length;

      const totalPages =
        typeof json?.meta?.total_pages === "number"
          ? json.meta.total_pages
          : typeof json?.total_pages === "number"
            ? json.total_pages
            : Math.max(1, Math.ceil(total / perPage));

      return {
        items,
        total,
        totalPages,
        error: null,
      };
    } catch (err) {
      return {
        items: [],
        total: 0,
        totalPages: 1,
        error: err.message || "Failed to fetch bookings.",
      };
    }
  }, [page, perPage]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchBookings();

      if (cancelled) return;

      setData(result.items);
      setMeta({
        total: result.total,
        totalPages: result.totalPages,
      });

      if (result.error) {
        setError(result.error);
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchBookings]);

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
    refetch: fetchBookings,
  };
}
