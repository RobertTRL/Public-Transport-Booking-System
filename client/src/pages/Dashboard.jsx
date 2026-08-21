import Sidebar from "../components/Sidebar";
import Profile from "../components/Profile";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back!</p>
          </div>

          <Profile />
        </div>

        <section className="dashboard-content">
          <div className="dashboard-card">
            <h2>Total Routes</h2>
            <p>0</p>
          </div>

          <div className="dashboard-card">
            <h2>Total Bookings</h2>
            <p>0</p>
          </div>

          <div className="dashboard-card">
            <h2>Available Vehicles</h2>
            <p>0</p>
          </div>

          <div className="dashboard-card">
            <h2>Total Vehicles</h2>
            <p>0</p>
          </div>
        </section>

        <section className="dashboard-map">
          <h2>Routes Map</h2>

          <div className="map-placeholder">
            <p>Map will be displayed here</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;