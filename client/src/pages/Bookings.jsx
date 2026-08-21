import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Bookings() {
  
  const todaysBookings = 24
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
              <p>0</p>
            </div>

            <div className="dashboard-card">
              <h3>Average Per Day</h3>
              <p>0</p>
            </div>

            <div className="dashboard-card">
              <h3>Busiest Day</h3>
              <p>None</p>
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