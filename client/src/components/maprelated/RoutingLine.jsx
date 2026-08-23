import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingLine({ waypoints }) {
  const map = useMap();

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return undefined;

    const control = L.Routing.control({
      waypoints: waypoints.map(([lat, lng]) => L.latLng(lat, lng)),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: "#ffffff", opacity: 0.6, weight: 10 },
          { color: "#1a73e8", opacity: 1, weight: 5 },
        ],
      },
    }).addTo(map);

    return () => map.removeControl(control);
  }, [map, waypoints]);

  return null;
}

export default RoutingLine;