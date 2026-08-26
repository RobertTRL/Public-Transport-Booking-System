import { useState } from "react";
// import "./Vehicles.css";

const vehicles = [
  {
    numberPlate: "KXX 123A",
    route: "Route A",
    capacity: 33,
    availability: "Available",
  },
  {
    numberPlate: "KYY 456B",
    route: "Route B",
    capacity: 45,
    availability: "Unavailable",
  },
  {
    numberPlate: "KZZ 789C",
    route: "Route C",
    capacity: 28,
    availability: "Available",
  },
  {
    numberPlate: "KAA 321D",
    route: "Route A",
    capacity: 50,
    availability: "Available",
  },
];

function Vehicles() {
  const [searchField, setSearchField] = useState("numberPlate");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVehicles = vehicles.filter((vehicle) =>
    String(vehicle[searchField])
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vehicles-page">
      <div className="dashboard-header">
        <h1>Vehicles</h1>
        <p>View and manage service provider vehicles.</p>
      </div>

      <section className="vehicles-content">
        <div className="vehicle-search">
          <select
            value={searchField}
            onChange={(event) => setSearchField(event.target.value)}
          >
            <option value="numberPlate">Number Plate</option>
            <option value="route">Route</option>
            <option value="capacity">Capacity</option>
            <option value="availability">Availability</option>
          </select>

          <input
            type="text"
            placeholder={`Search by ${searchField}`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
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
                    <td>{vehicle.availability}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Vehicles;
