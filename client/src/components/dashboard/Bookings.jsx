import "../styles/dashboard.css";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Bookings() {
  const todaysBookings = 24;
  const weeklyBookings = 142;

  const averageBookingsPerDay = (weeklyBookings / 7).toFixed(1);

  const weeklyBookingData = [
    { day: "Monday", bookings: 18 },
    { day: "Tuesday", bookings: 22 },
    { day: "Wednesday", bookings: 30 },
    { day: "Thursday", bookings: 19 },
    { day: "Friday", bookings: 27 },
    { day: "Saturday", bookings: 16 },
    { day: "Sunday", bookings: 10 },
  ];

  const chartData = {
    labels: weeklyBookingData.map((item) => item.day),
    datasets: [
      {
        label: "Bookings",
        data: weeklyBookingData.map((item) => item.bookings),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  const busiestDay = weeklyBookingData.reduce(
    (highest, current) =>
      current.bookings > highest.bookings ? current : highest
  );

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

        <div className="booking-statistics-grid">
          <div className="dashboard-card">
            <h3>Today's Bookings</h3>
            <p>{todaysBookings}</p>
          </div>

          <div className="dashboard-card">
            <h3>Total This Week</h3>
            <p>{weeklyBookings}</p>
          </div>

          <div className="dashboard-card">
            <h3>Average Per Day</h3>
            <p>{averageBookingsPerDay}</p>
          </div>

          <div className="dashboard-card">
            <h3>Busiest Day</h3>
            <p>{busiestDay.day}</p>
          </div>
        </div>
      </section>

      <section className="bookings-chart">
        <h2>Bookings Across the Past Week</h2>

        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </section>
    </>
  );
}

export default Bookings;