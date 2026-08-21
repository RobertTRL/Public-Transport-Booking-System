import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Bookings() {
  
  const todaysBookings = 24
    const weeklyBookings = 142
const averageBookingsPerDay = (
  weeklyBookings / 7
).toFixed(1)
const weeklyBookingData = [
  { day: 'Monday', bookings: 18 },
  { day: 'Tuesday', bookings: 22 },
  { day: 'Wednesday', bookings: 30 },
  { day: 'Thursday', bookings: 19 },
  { day: 'Friday', bookings: 27 },
  { day: 'Saturday', bookings: 16 },
  { day: 'Sunday', bookings: 10 },
]
const busiestDay = weeklyBookingData.reduce(
  (highest, current) =>
    current.bookings > highest.bookings
      ? current
      : highest
)
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
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
            <p>Booking chart will appear here.</p>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Bookings;