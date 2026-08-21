import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [-1.286389, 36.817223];

function Map({ locations = [], routes = [] }) {
  const center = locations.length > 0
    ? locations[0].position
    : DEFAULT_CENTER;

  return (
    <div className="transport-map">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="map-container"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route lines */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
          >
            <Popup>
              <div className="map-popup">
                <h3>{route.name}</h3>
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
          >
            <Popup>
              <div className="map-popup">
                <h3>{location.name}</h3>

                {location.type && (
                  <strong>{location.type}</strong>
                )}

                {location.description && (
                  <p>{location.description}</p>
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