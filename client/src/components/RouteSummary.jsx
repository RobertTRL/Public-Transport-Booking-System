import React from "react";
import "../styles/RouteMap.css";

const RouteMap = () => {
  return (
    <div className="route-map">

      {/* Map background */}
      <div className="map-background">

        {/* Route 1 */}
        <div className="route-line route-one"></div>

        {/* Route 2 */}
        <div className="route-line route-two"></div>

        {/* Route 3 */}
        <div className="route-line route-three"></div>

        {/* Stops */}
        <div className="map-stop stop-1">
          <span></span>
          <p>Nairobi</p>
        </div>

        <div className="map-stop stop-2">
          <span></span>
          <p>Roysambu</p>
        </div>

        <div className="map-stop stop-3">
          <span></span>
          <p>Ruiru</p>
        </div>

        <div className="map-stop stop-4">
          <span></span>
          <p>Thika</p>
        </div>

        <div className="map-stop stop-5">
          <span></span>
          <p>Kiambu</p>
        </div>

      </div>

      {/* Map legend */}
      <div className="map-legend">

        <div className="legend-item">
          <span className="legend-dot blue"></span>
          <p>Route 1</p>
        </div>

        <div className="legend-item">
          <span className="legend-dot green"></span>
          <p>Route 2</p>
        </div>

        <div className="legend-item">
          <span className="legend-dot orange"></span>
          <p>Route 3</p>
        </div>

      </div>

    </div>
  );
};

export default RouteMap;