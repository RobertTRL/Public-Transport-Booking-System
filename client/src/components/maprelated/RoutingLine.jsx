import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { isValidPosition } from "../../utils/routeSelection";

function RoutingLine({ waypoints }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    const validWaypoints = Array.isArray(waypoints)
      ? waypoints.filter(isValidPosition)
      : [];

    if (!map || validWaypoints.length < 2) return undefined;

    const control = L.Routing.control({
      waypoints: validWaypoints.map(([lat, lng]) => L.latLng(lat, lng)),
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
    });

    controlRef.current = control;
    control.addTo(map);

    return () => {
      const currentControl = controlRef.current;
      controlRef.current = null;

      if (!currentControl) return;

      try {
        const router = currentControl.getRouter?.();
        if (router && typeof router.abort === "function") router.abort();
      } catch {
        // Ignore router cleanup errors.
      }

      try {
        if (map && map._loaded) map.removeControl(currentControl);
      } catch {
        // Ignore control cleanup errors.
      }
    };
  }, [map, waypoints]);

  return null;
}

export default RoutingLine;
