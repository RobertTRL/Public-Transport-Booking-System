import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const NAIROBI_CENTER = [-1.286389, 36.817223];

function Map() {
  return (
    <div className="transport-map">
      <MapContainer
        center={NAIROBI_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}

export default Map;