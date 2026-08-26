import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import "../../styles/dashboard.css";

const stops = [
  {
    id: "kigali-city-centre",
    name: "Kigali City Centre",
    description: "Central bus station",
    location: "KN 4 Ave",
    routes: 8,
    status: "Active",
  },
  {
    id: "nyabugogo",
    name: "Nyabugogo",
    description: "Nyabugogo bus terminal",
    location: "KK 14 Rd",
    routes: 12,
    status: "Active",
  },
  {
    id: "kimironko",
    name: "Kimironko",
    description: "Kimironko market stop",
    location: "KG 11 Ave",
    routes: 6,
    status: "Active",
  },
];

function Stops() {
  return (
    <>
      <div className="dashboard-header stops-header">
        <div>
          <h1>Stops</h1>
          <p>View and manage public transport stops.</p>
        </div>

        <button type="button" className="add-stop-button">
          <Plus size={16} />
          Add Stop
        </button>
      </div>

      <section className="stops-section">
        <div className="stops-grid">
          {stops.map((stop) => (
            <article className="stop-card" key={stop.id}>
              <div className="stop-card-top">
                <div className="stop-icon">
                  <MapPin size={20} />
                </div>

                <span className="stop-status">{stop.status}</span>
              </div>

              <h2>{stop.name}</h2>
              <p className="stop-description">{stop.description}</p>

              <div className="stop-details">
                <div className="stop-detail">
                  <span className="stop-detail-label">Location</span>
                  <span className="stop-detail-value">{stop.location}</span>
                </div>

                <div className="stop-detail">
                  <span className="stop-detail-label">Routes</span>
                  <span className="stop-detail-value">
                    {stop.routes} routes
                  </span>
                </div>
              </div>

              <div className="stop-actions">
                <button type="button" className="edit-stop-button">
                  <Pencil size={14} />
                  Edit
                </button>

                <button type="button" className="remove-stop-button">
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Stops;
