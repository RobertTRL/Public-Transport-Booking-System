const MainContent = () => {
  return (
    <div className="main-content">

      {/* Page Heading */}
      <div className="content-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's an overview of your services.</p>
        </div>

        <button className="create-route-btn">
          + Create Route
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-container">

        <div className="stat-card">
          <div className="stat-icon">🚌</div>
          <div>
            <p>Total Routes</p>
            <h2>12</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <p>Customers</p>
            <h2>245</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚍</div>
          <div>
            <p>Available Vehicles</p>
            <h2>8</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚐</div>
          <div>
            <p>Total Vehicles</p>
            <h2>15</h2>
          </div>
        </div>

      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Routes */}
        <div className="dashboard-card routes-card">
          <div className="card-header">
            <h2>Routes</h2>
            <button className="view-btn">View All</button>
          </div>

          <div className="route-item">
            <div>
              <h3>Nairobi → Thika</h3>
              <p>Vehicle: KCA 123A</p>
            </div>

            <div className="route-info">
              <span>24 Bookings</span>
              <span className="available">8 seats left</span>
            </div>
          </div>

          <div className="route-item">
            <div>
              <h3>Nairobi → Kiambu</h3>
              <p>Vehicle: KCB 456B</p>
            </div>

            <div className="route-info">
              <span>18 Bookings</span>
              <span className="available">12 seats left</span>
            </div>
          </div>

          <div className="route-item">
            <div>
              <h3>Nairobi → Limuru</h3>
              <p>Vehicle: KDD 789C</p>
            </div>

            <div className="route-info">
              <span>15 Bookings</span>
              <span className="available">5 seats left</span>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="dashboard-card bookings-card">
          <div className="card-header">
            <h2>Recent Bookings</h2>
            <button className="view-btn">View All</button>
          </div>

          <div className="booking-item">
            <div className="passenger">
              <div className="avatar">JD</div>
              <div>
                <h3>John Doe</h3>
                <p>Nairobi → Thika</p>
              </div>
            </div>

            <span className="booking-status">Confirmed</span>
          </div>

          <div className="booking-item">
            <div className="passenger">
              <div className="avatar">AM</div>
              <div>
                <h3>Ann Mwangi</h3>
                <p>Nairobi → Kiambu</p>
              </div>
            </div>

            <span className="booking-status">Confirmed</span>
          </div>

          <div className="booking-item">
            <div className="passenger">
              <div className="avatar">PK</div>
              <div>
                <h3>Peter Kamau</h3>
                <p>Nairobi → Limuru</p>
              </div>
            </div>

            <span className="booking-status">Pending</span>
          </div>
        </div>

      </div>

      {/* Map */}
      <div className="dashboard-card map-card">

        <div className="card-header">
          <div>
            <h2>All Routes</h2>
            <p>View your routes and stops on the map</p>
          </div>

          <button className="view-btn">View Routes</button>
        </div>

        <div className="map-placeholder">
          <div className="map-message">
            <div className="map-icon">📍</div>
            <h3>Routes Map</h3>
            <p>
              Your routes and stops will appear here.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MainContent;