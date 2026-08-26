import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { vehicles } from "../../data/routesData";
import "../../styles/Vehicle.css";

function Vehicles() {
  const [searchField, setSearchField] = useState("numberPlate");
  const [searchTerm, setSearchTerm] = useState("");

  const availableCount = vehicles.filter(
    (vehicle) => vehicle.availability === "Available"
  ).length;

  const filteredVehicles = vehicles.filter((vehicle) =>
    String(vehicle[searchField])
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="dashboard-header vehicles-header">
        <div>
          <h1>Vehicles</h1>
          <p>View and manage service provider vehicles.</p>
        </div>

        <button type="button" className="add-vehicle-button">
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      <section className="dashboard-content vehicles-summary">
        <div className="dashboard-card">
          <h2>Total Vehicles</h2>
          <p>{vehicles.length}</p>
        </div>

        <div className="dashboard-card">
          <h2>Available</h2>
          <p>{availableCount}</p>
        </div>

        <div className="dashboard-card">
          <h2>Unavailable</h2>
          <p>{vehicles.length - availableCount}</p>
        </div>
      </section>

      <section className="vehicles-panel">
        <div className="vehicles-toolbar">
          <div className="vehicle-search">
            <Search size={16} className="vehicle-search-icon" />

            <input
              type="text"
              placeholder={`Search by ${searchField}`}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={searchField}
              onChange={(event) => setSearchField(event.target.value)}
            >
              <option value="numberPlate">Number Plate</option>
              <option value="route">Route</option>
              <option value="capacity">Capacity</option>
              <option value="availability">Availability</option>
            </select>
          </div>
        </div>

        <div className="vehicle-table-container">
          <table className="vehicle-table">
            <thead>
              <tr>
                <th>Number Plate</th>
                <th>Route</th>
                <th>Capacity</th>
                <th>Availability</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.numberPlate}>
                    <td>{vehicle.numberPlate}</td>
                    <td>{vehicle.route}</td>
                    <td>{vehicle.capacity}</td>
                    <td>
                      <span
                        className={`availability-badge availability-${vehicle.availability.toLowerCase()}`}
                      >
                        {vehicle.availability}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="vehicle-table-empty">
                    No vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default Vehicles;
