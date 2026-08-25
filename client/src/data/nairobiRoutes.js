export const nairobiRoutes = [
  {
    id: "thika-road",
    name: "Thika Road",
    color: "#e63946",
    stops: [
      { id: "tr-1", name: "Ngara", position: [-1.2762, 36.8296] },
      { id: "tr-2", name: "Pangani", position: [-1.2685, 36.8353] },
      { id: "tr-3", name: "Muthaiga", position: [-1.2528, 36.8219] },
      { id: "tr-4", name: "Roysambu", position: [-1.2189, 36.8899] },
      { id: "tr-5", name: "Kasarani", position: [-1.2219, 36.8976] },
      { id: "tr-6", name: "Ruiru", position: [-1.1460, 36.9580] },
      { id: "tr-7", name: "Thika Town", position: [-1.0333, 37.0693] },
    ],
  },
  {
    id: "mombasa-road",
    name: "Mombasa Road",
    color: "#1a73e8",
    stops: [
      { id: "mr-1", name: "Nyayo Stadium", position: [-1.3096, 36.8226] },
      { id: "mr-2", name: "South B", position: [-1.3182, 36.8324] },
      { id: "mr-3", name: "Airport North Road", position: [-1.3220, 36.8843] },
      { id: "mr-4", name: "JKIA", position: [-1.3192, 36.9278] },
      { id: "mr-5", name: "Syokimau", position: [-1.3766, 36.9436] },
      { id: "mr-6", name: "Athi River", position: [-1.4557, 36.9770] },
    ],
  },
  {
    id: "waiyaki-way",
    name: "Waiyaki Way",
    color: "#2a9d8f",
    stops: [
      { id: "ww-0", name: "Archives", position: [-1.2850, 36.8258] }, // new — Nairobi CBD start
      { id: "ww-1", name: "Westlands", position: [-1.2676, 36.8108] },
      { id: "ww-2", name: "Mountain View", position: [-1.2625, 36.7811] },
      { id: "ww-3", name: "Kangemi", position: [-1.2649, 36.7503] },
      { id: "ww-4", name: "Uthiru", position: [-1.2659, 36.6994] },
      { id: "ww-5", name: "Kikuyu", position: [-1.2478, 36.6642] },
    ],
  },
  {
    id: "ngong-road",
    name: "Ngong Road",
    color: "#f4a261",
    stops: [
      { id: "nr-1", name: "Adams Arcade", position: [-1.3008, 36.7876] },
      { id: "nr-2", name: "Prestige Plaza", position: [-1.3067, 36.7797] },
      { id: "nr-3", name: "Karen", position: [-1.3192, 36.7076] },
      { id: "nr-4", name: "Ngong Town", position: [-1.3559, 36.6530] },
    ],
  },
];

// Flat list for the dropdowns and for rendering every pin on the map
export const allStops = nairobiRoutes.flatMap((route) =>
  route.stops.map((stop) => ({
    ...stop,
    routeId: route.id,
    routeName: route.name,
  }))
);

// Look up a single stop by its id across all routes
export function getStopById(stopId) {
  return allStops.find((s) => s.id === stopId) || null;
}

// Look up a route definition by its id
export function getRouteById(routeId) {
  return nairobiRoutes.find((r) => r.id === routeId) || null;
}

// Find which route a given stop belongs to
export function getRouteForStop(stopId) {
  return nairobiRoutes.find((route) =>
    route.stops.some((s) => s.id === stopId)
  ) || null;
}