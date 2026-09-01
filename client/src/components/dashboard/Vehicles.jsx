import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { vehicles as seedVehicles } from "../../data/routesData";
import AddVehicleModal from "./AddVehicleModal";
import "../../styles/Vehicle.css";

function Vehicles() {
  const [vehicles, setVehicles] = useState(seedVehicles);
  const [searchField, setSearchField] = useState("numberPlate");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const availableCount = vehicles.filter(
    (vehicle) => vehicle.availability === "Available"
  ).length;

  const filteredVehicles = vehicles.filter((vehicle) =>
    String(vehicle[searchField] ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleAddVehicle = (vehicle) => {
    setVehicles((list) => [
      { id: `vehicle-${Date.now()}`, ...vehicle },
      ...list,
    ]);
  };

  return (
    <div className="vehicles-page">
      <div className="vehicles-header">
        <div>
          <h1>Vehicles</h1>
          <p>View and manage service provider vehicles.</p>
        </div>
        <button
          type="button"
          className="add-vehicle-button"
          onClick={() => setModalOpen(true)}
        >
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
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="font-semibold">{vehicle.numberPlate}</td>
                    <td>{vehicle.route || "Unassigned"}</td>
                    <td>{vehicle.capacity}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          vehicle.availability === "Available"
                            ? "status-available"
                            : "status-unavailable"
                        }`}
                      >
                        {vehicle.availability}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="edit-button">Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddVehicleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAddVehicle}
      />
    </div>
  );
}

export default Vehicles;