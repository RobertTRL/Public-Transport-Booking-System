import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const NAIROBI_CENTER = [-1.286389, 36.817223];

const transportLocations = [
  {
    id: 1,
    name: "Nairobi CBD",
    position: [-1.286389, 36.817223],
    type: "Main Terminal",
    description: "Central Nairobi pickup and drop-off point.",
  },
  {
    id: 2,
    name: "Westlands",
    position: [-1.2676, 36.8108],
    type: "Transport Stop",
    description: "Popular passenger pickup point serving Westlands.",
  },
  {
    id: 3,
    name: "Ngong Road",
    position: [-1.3008, 36.7876],
    type: "Transport Stop",
    description: "Passenger pickup point serving Ngong Road.",
  },
  {
    id: 4,
    name: "Kasarani",
    position: [-1.2219, 36.8976],
    type: "Transport Stop",
    description: "Passenger pickup point serving Kasarani.",
  },
];

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
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {transportLocations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
          >
            <Popup>
              <div className="map-popup">
                <h3>{location.name}</h3>
                <strong>{location.type}</strong>
                <p>{location.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;