import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [-1.286389, 36.817223];

const transportIcon = L.divIcon({
  className: "transport-marker",
  html: `
    <div class="transport-marker-icon">
      <span>●</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

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

    const container = map.getContainer();
    container.appendChild(control);

    return () => {
      control.remove();
    };
  }, [map, show]);

  return null;
}

function Map({ locations = [], routes = [] }) {
  const hasMapData = locations.length > 0 || routes.length > 0;

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

        <MapEmptyState show={!hasMapData} />

        {/* Route lines */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions || []}
            pathOptions={{
              color: route.color || "#2563eb",
              weight: 5,
              opacity: 0.8,
            }}
          >
            <Popup>
              <div className="map-popup">
                <h3>{route.name || "Transport Route"}</h3>

                {route.description && (
                  <p>{route.description}</p>
                )}
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Transport stops */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            icon={transportIcon}
          >
            <Popup>
              <div className="map-popup">
                <h3>{location.name || "Transport Stop"}</h3>

                <strong>
                  {location.type || "Transport Stop"}
                </strong>

                {location.description ? (
                  <p>{location.description}</p>
                ) : (
                  <p>
                    Public transport pickup and drop-off point.
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;