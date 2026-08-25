import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingLine from "./RoutingLine";

const DEFAULT_CENTER = [-1.286389, 36.817223];
const MOBILE_BREAKPOINT = "(max-width: 768px)";

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    function fitToStops() {
      if (stops.length === 0) {
        map.setView(DEFAULT_CENTER, 12);
        return;
      }

      const bounds = stops.map((stop) => stop.position);

      // Offset the fitted view away from whichever side the search
      // panel currently covers, so selected stops aren't hidden under it.
      const fitOptions = mediaQuery.matches
        ? {
            // Bottom sheet on mobile — leave clearance below
            paddingTopLeft: [24, 24],
            paddingBottomRight: [24, 260],
            maxZoom: 14,
          }
        : {
            // Left sidebar on desktop (~360px wide) — leave clearance on the left
            paddingTopLeft: [380, 40],
            paddingBottomRight: [40, 40],
            maxZoom: 14,
          };

      map.fitBounds(bounds, fitOptions);
    }

    fitToStops();
    mediaQuery.addEventListener("change", fitToStops);
    return () => mediaQuery.removeEventListener("change", fitToStops);
  }, [map, stops]);

  return null;
}

function getStopLabel(stop, origin, destination) {
  if (origin && stop.id === origin.id) return `${stop.name} (Start)`;
  if (destination && stop.id === destination.id) return `${stop.name} (Destination)`;
  return stop.name;
}

function Map({ stops, origin, destination, highlightedStopIds = [], waypoints, onSelectStop }) {
  function getIcon(stop) {
    if (origin && stop.id === origin.id) return originIcon;
    if (destination && stop.id === destination.id) return destinationIcon;
    if (highlightedStopIds.includes(stop.id)) return highlightedIcon;
    return defaultIcon;
  }

  return (
    <div className="transport-map">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom={true}
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
            <Tooltip direction="top" offset={[0, -42]} opacity={0.9}>
              {getStopLabel(stop, origin, destination)}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;