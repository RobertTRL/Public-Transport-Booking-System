import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingLine from "./RoutingLine";

const DEFAULT_CENTER = [-1.286389, 36.817223];

const originIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const highlightedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapBounds({ stops }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }
    map.fitBounds(
      stops.map((stop) => stop.position),
      { padding: [40, 40], maxZoom: 14 }
    );
  }, [map, stops]);

  return null;
}

function Map({ stops, origin, destination, highlightedStopIds = [], waypoints, onSelectStop }) {
  function getIcon(stop) {
    if (origin && stop.id === origin.id) return originIcon;
    if (destination && stop.id === destination.id) return destinationIcon;
    if (highlightedStopIds.includes(stop.id)) return highlightedIcon;
    return undefined; // default Leaflet pin
  }

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

        <MapBounds stops={stops} />

        {waypoints && waypoints.length >= 2 && <RoutingLine waypoints={waypoints} />}

        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={stop.position}
            icon={getIcon(stop)}
            eventHandlers={{ click: () => onSelectStop(stop) }}
          >
            <Popup>
              <div className="map-popup">
                <h3>{stop.name}</h3>
                <strong>{stop.routeName}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;