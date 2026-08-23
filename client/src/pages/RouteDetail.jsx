import { useMemo } from "react";
import { useParams } from "react-router-dom";
import "./RouteDetail.css";

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

function RouteDetail() {
  const { routeName } = useParams();

  const routeVehicles = useMemo(
    () => vehicles.filter((v) => v.route === routeName),
    [routeName]
  );

  return (
    <div className="route-detail-page">
      <div className="dashboard-header">
        <h1>{routeName}</h1>
        <p>Vehicles assigned to this route.</p>
      </div>

      <section className="route-detail-content">
        <div className="route-detail-table-container">
          <table className="route-detail-table">
            <thead>
              <tr>
                <th>Number Plate</th>
                <th>Route</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {routeVehicles.length > 0 ? (
                routeVehicles.map((vehicle) => (
                  <tr key={vehicle.numberPlate}>
                    <td>{vehicle.numberPlate}</td>
                    <td>{vehicle.route}</td>
                    <td>{vehicle.capacity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No vehicles found for this route.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default RouteDetail;
