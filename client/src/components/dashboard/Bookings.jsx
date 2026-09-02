import { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { apiGet } from "../../api/client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function getStatisticItems(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.statistics)) {
    return data.statistics;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function getBookingCount(item) {
  return Number(
    item?.bookings ??
      item?.booking_count ??
      item?.count ??
      item?.total ??
      0
  );
}

function getDateValue(item) {
  return item?.date || item?.day || item?.booking_date || "";
}

function getDayLabel(item) {
  const value = getDateValue(item);

  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  }

  return String(value);
}

function getTodayKey() {
  const now = new Date();

  return now.toISOString().slice(0, 10);
}

function isToday(item) {
  const value = getDateValue(item);

  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).toLowerCase() ===
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
      }).toLowerCase();
  }

  return date.toISOString().slice(0, 10) === getTodayKey();
}

function Bookings() {
  const [statistics, setStatistics] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatistics() {
      setLoading(true);
      setError("");

      try {
        const data = await apiGet(
          "/api/v1/provider/booking-statistics?group_by=day"
        );

        if (!cancelled) {
          setStatistics(getStatisticItems(data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load booking statistics."
          );
          setStatistics([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentBookings() {
      setBookingsLoading(true);
      setBookingsError("");

      try {
        const data = await apiGet(
          "/api/v1/provider/bookings?page=1&per_page=5"
        );

        if (cancelled) return;

        const bookings = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.bookings)
                ? data.bookings
                : [];

        setRecentBookings(bookings);
      } catch (err) {
        if (!cancelled) {
          setBookingsError(
            err.message || "Unable to load recent bookings."
          );
          setRecentBookings([]);
        }
      } finally {
        if (!cancelled) {
          setBookingsLoading(false);
        }
      }
    }

    loadRecentBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const weeklyBookings = useMemo(
    () =>
      statistics.reduce(
        (total, item) => total + getBookingCount(item),
        0
      ),
    [statistics]
  );

  const todaysBookings = useMemo(
    () =>
      statistics
        .filter(isToday)
        .reduce(
          (total, item) => total + getBookingCount(item),
          0
        ),
    [statistics]
  );

  const averageBookingsPerDay = useMemo(() => {
    if (!statistics.length) {
      return "0.0";
    }

    return (weeklyBookings / 7).toFixed(1);
  }, [statistics.length, weeklyBookings]);

  const busiestDay = useMemo(() => {
    if (!statistics.length) {
      return "—";
    }

    const busiest = statistics.reduce((highest, current) =>
      getBookingCount(current) > getBookingCount(highest)
        ? current
        : highest
    );

    return getDayLabel(busiest);
  }, [statistics]);

  const chartData = useMemo(
    () => ({
      labels: statistics.map(getDayLabel),
      datasets: [
        {
          label: "Bookings",
          data: statistics.map(getBookingCount),
          barThickness: 18,
          maxBarThickness: 20,
          categoryPercentage: 0.6,
          barPercentage: 0.65,
        },
      ],
    }),
    [statistics]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Bookings</h1>
          <p>View booking statistics and activity.</p>
        </div>
      </div>

      <section className="bookings-statistics">
        <h2>Total Users Per Week</h2>

        {error && <p>{error}</p>}

        <div className="booking-statistics-grid">
          <div className="dashboard-card">
            <h3>Today's Bookings</h3>
            <p>
              {loading ? "..." : todaysBookings}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Total This Week</h3>
            <p>
              {loading ? "..." : weeklyBookings}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Average Per Day</h3>
            <p>
              {loading ? "..." : averageBookingsPerDay}
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Busiest Day</h3>
            <p>
              {loading ? "..." : busiestDay}
            </p>
          </div>
        </div>
      </section>

      <section className="bookings-chart">
        <h2>Bookings Across the Past Week</h2>

        <div className="chart-container">
          {loading ? (
            <p>Loading booking statistics...</p>
          ) : statistics.length === 0 ? (
            <p>No booking statistics available.</p>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </section>

      <section className="bookings-statistics">
        <h2>Recent Bookings</h2>

        {bookingsError && <p>{bookingsError}</p>}

        {bookingsLoading ? (
          <p>Loading recent bookings...</p>
        ) : recentBookings.length === 0 ? (
          <p>No recent bookings.</p>
        ) : (
          <div className="dashboard-card">
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Passenger</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking, index) => (
                    <tr
                      key={
                        booking.id ??
                        booking.booking_id ??
                        index
                      }
                    >
                      <td>
                        {booking.passenger_name ||
                          booking.passenger?.name ||
                          booking.user?.name ||
                          "—"}
                      </td>

                      <td>
                        {booking.route_name ||
                          booking.route?.name ||
                          booking.route ||
                          "—"}
                      </td>

                      <td>
                        {booking.status || "—"}
                      </td>

                      <td>
                        {booking.booking_date ||
                          booking.created_at ||
                          booking.date ||
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default Bookings;