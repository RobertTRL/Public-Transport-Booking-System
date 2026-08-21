import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
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

function Map({ locations = [], routes = [] }) {
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

        {/* Route lines */}
        {routes.map((route) => (
          <Polyline
             key={route.id}
              positions={route.positions}
              pathOptions={{
               color: route.color || "#2563eb",
             weight: 5,
              opacity: 0.8,
               }}
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