import React from "react";

const RouteSummary = () => {
  return (
    <div className="route-summary">
      <div className="route-summary-header">
        <h2>Route Summary</h2>
        <p>Overview of available transport routes</p>
      </div>

      <div className="route-summary-list">
        <div className="route-summary-item">
          <h3>Route 1</h3>
          <p>Nairobi → Roysambu → Ruiru</p>
        </div>

        <div className="route-summary-item">
          <h3>Route 2</h3>
          <p>Nairobi → Kiambu → Thika</p>
        </div>

        <div className="route-summary-item">
          <h3>Route 3</h3>
          <p>Roysambu → Kiambu → Thika</p>
        </div>
      </div>
    </div>
  );
};

export default RouteSummary;