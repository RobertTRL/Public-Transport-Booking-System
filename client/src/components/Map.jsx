import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [-1.286389, 36.817223];

function MapBounds({ locations, routes }) {
  const map = useMap();

  useEffect(() => {
    const points = [
      ...locations.map((location) => location.position),
      ...routes.flatMap((route) => route.positions || []),
    ];

    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }

    map.fitBounds(points, {
      padding: [40, 40],
      maxZoom: 14,
    });
  }, [map, locations, routes]);

  return null;
}

function MapEmptyState({ show }) {
  const map = useMap();

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const control = document.createElement("div");

    control.className = "map-empty-state";
    control.innerHTML = `
      <strong>No transport data available</strong>
      <span>Routes and stops will appear here.</span>
    `;

    map.getContainer().appendChild(control);

    return () => {
      control.remove();
    };
  }, [map, show]);

  return null;
}

function ResetMapButton({ locations, routes }) {
  const map = useMap();

  const resetView = () => {
    const points = [
      ...locations.map((location) => location.position),
      ...routes.flatMap((route) => route.positions || []),
    ];

    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }

    map.fitBounds(points, {
      padding: [40, 40],
      maxZoom: 14,
    });
  };

  return (
    <button
      type="button"
      className="map-reset-button"
      onClick={resetView}
    >
      Reset view
    </button>
  );
}

function MapLegend({ routes, selectedRoute, onSelectRoute }) {
  const [visible, setVisible] = useState(true);

  if (routes.length === 0) {
    return null;
  }

  return (
    <div className={`map-legend ${visible ? "" : "collapsed"}`}>
      <button
        type="button"
        className="map-legend-toggle"
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? "Hide routes" : "Show routes"}
      </button>

      {visible && (
        <div className="map-legend-content">
          <strong>Routes</strong>

          {routes.map((route) => {
            const isSelected = selectedRoute === route.id;

            return (
              <button
                type="button"
                className={`map-legend-item ${
                  isSelected ? "selected" : ""
                }`}
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
              >
                <span
                  className="map-legend-line"
                  style={{
                    backgroundColor:
                      route.color || "#2563eb",
                  }}
                />

                <span>
                  {route.name || "Transport Route"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MapSummary({ locations, routes }) {
  return (
    <div className="map-summary">
      <div className="map-summary-item">
        <strong>{routes.length}</strong>
        <span>Routes</span>
      </div>

      <div className="map-summary-item">
        <strong>{locations.length}</strong>
        <span>Stops</span>
      </div>
    </div>
  );
}

function Map({ locations = [], routes = [] }) {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const hasMapData =
    locations.length > 0 || routes.length > 0;

  return (
    <div className="transport-map">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapBounds
          locations={locations}
          routes={routes}
        />

        <ResetMapButton
          locations={locations}
          routes={routes}
        />

        <MapEmptyState show={!hasMapData} />

        {/* Route lines */}
        {routes.map((route) => {
          const isSelected =
            selectedRoute === route.id;

          return (
            <Polyline
              key={route.id}
              positions={route.positions || []}
              pathOptions={{
                color: route.color || "#2563eb",
                weight: isSelected ? 8 : 5,
                opacity: isSelected ? 1 : 0.75,
              }}
              eventHandlers={{
                click: () => {
                  setSelectedRoute(route.id);
                },
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h3>
                    {route.name || "Transport Route"}
                  </h3>

                  {route.description && (
                    <p>{route.description}</p>
                  )}
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Transport stops */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
          >
            <Popup>
              <div className="map-popup">
                <h3>
                  {location.name || "Transport Stop"}
                </h3>

                <strong>
                  {location.type || "Transport Stop"}
                </strong>

                {location.description ? (
                  <p>{location.description}</p>
                ) : (
                  <p>
                    Public transport pickup and
                    drop-off point.
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapSummary
        locations={locations}
        routes={routes}
      />

      <MapLegend
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
      />
    </div>
  );
}

export default Map;