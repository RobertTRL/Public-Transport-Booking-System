import "../../styles/dashboard.css";

function Stops() {
  const stops = [
    {
      name: "Kigali City Centre",
      description: "Central bus station",
      location: "KN 4 Ave",
      routes: 8,
      status: "Active",
    },
    {
      name: "Nyabugogo",
      description: "Nyabugogo bus terminal",
      location: "KK 14 Rd",
      routes: 12,
      status: "Active",
    },
    {
      name: "Kimironko",
      description: "Kimironko market stop",
      location: "KG 11 Ave",
      routes: 6,
      status: "Active",
    },
  ];

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Stops</h1>
          <p>View and manage public transport stops.</p>
        </div>

        <button className="add-stop-button">
          <span className="add-stop-icon">+</span>
          Add Stop
        </button>
      </div>

      <section className="stops-section">
        <div className="stops-grid">
          {stops.map((stop) => (
            <div className="stop-card" key={stop.name}>
              <div className="stop-card-header">
                <div className="stop-icon">
                  <span>⌖</span>
                </div>

                <span className="stop-status">{stop.status}</span>
              </div>

              <h2>{stop.name}</h2>

              <p>{stop.description}</p>

              <div className="stop-details">
                <div className="stop-detail">
                  <span className="stop-detail-icon">📍</span>

                  <div>
                    <span className="stop-detail-label">Location</span>

                    <span className="stop-detail-value">
                      {stop.location}
                    </span>
                  </div>
                </div>

                <div className="stop-detail">
                  <span className="stop-detail-icon">🚌</span>

                  <div>
                    <span className="stop-detail-label">Routes</span>

                    <span className="stop-detail-value">
                      {stop.routes} routes
                    </span>
                  </div>
                </div>
              </div>

              <div className="stop-actions">
                <button className="edit-stop-button">Edit</button>

                <button className="remove-stop-button">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Stops;