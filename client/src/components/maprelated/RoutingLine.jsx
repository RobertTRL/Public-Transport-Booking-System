import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RoutingLine({ waypoints }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return undefined;

    if (controlRef.current) {
      try {
        map.removeControl(controlRef.current);
      } catch {
        // control may already have been removed
      }
      controlRef.current = null;
    }

    const control = L.Routing.control({
      waypoints: waypoints.map(([lat, lng]) => L.latLng(lat, lng)),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: "#ffffff", opacity: 0.6, weight: 10 },
          { color: "#1a73e8", opacity: 1, weight: 5 },
        ],
      },
    }).addTo(map);

    controlRef.current = control;

    return () => {
      try {
        map.removeControl(control);
      } catch {
        // control may already have been removed during unmount
      }
      controlRef.current = null;
    };
  }, [map, waypoints]);

  return null;
}

export default RoutingLine;