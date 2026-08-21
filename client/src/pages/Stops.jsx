import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Stops() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Stops</h1>
            <p>View and manage public transport stops.</p>
          </div>

          <button className="add-stop-button">
            + Add Stop
          </button>
        </div>

        <section className="stops-section">
          <div className="stops-grid">

            <div className="stop-card">
              <h2>Kigali City Centre</h2>
              <p>Central bus station</p>

  <span className="stop-status">
    Active
  </span>

              <div className="stop-actions">
                <button className="edit-stop-button">
                  Edit
                </button>

                <button className="remove-stop-button">
                  Remove
                </button>
              </div>
            </div>

            <div className="stop-card">
              <h2>Nyabugogo</h2>
              <p>Nyabugogo bus terminal</p>

  <span className="stop-status">
    Active
  </span>

              <div className="stop-actions">
                <button className="edit-stop-button">
                  Edit
                </button>

                <button className="remove-stop-button">
                  Remove
                </button>
              </div>
            </div>

            <div className="stop-card">
              <h2>Kimironko</h2>
              <p>Kimironko market stop</p>

  <span className="stop-status">
    Active
  </span>

              <div className="stop-actions">
                <button className="edit-stop-button">
                  Edit
                </button>

                <button className="remove-stop-button">
                  Remove
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default Stops;