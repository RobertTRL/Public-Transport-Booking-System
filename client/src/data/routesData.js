// Temporary mock data for routes and vehicles.
// Once the backend is connected, replace these with API calls.

export const routes = [
  {
    name: "Route A",
    color: "#2563eb",
    description: "CBD – Karen loop via Ngong Road.",
  },
  {
    name: "Route B",
    color: "#16a34a",
    description: "Ruiru – Thika superhighway express.",
  },
  {
    name: "Route C",
    color: "#dc2626",
    description: "Athi River – Kitengela connector.",
  },
  {
    name: "Route D",
    color: "#9333ea",
    description: "Westlands – Lavington residential.",
  },
];

export const vehicles = [
  { numberPlate: "KXX 123A", route: "Route A", capacity: 33, availability: "Available" },
  { numberPlate: "KAA 321D", route: "Route A", capacity: 50, availability: "Available" },
  { numberPlate: "KBB 654E", route: "Route A", capacity: 28, availability: "Unavailable" },
  { numberPlate: "KYY 456B", route: "Route B", capacity: 45, availability: "Unavailable" },
  { numberPlate: "KCC 987F", route: "Route B", capacity: 40, availability: "Available" },
  { numberPlate: "KZZ 789C", route: "Route C", capacity: 28, availability: "Available" },
  { numberPlate: "KDD 147G", route: "Route C", capacity: 60, availability: "Available" },
  { numberPlate: "KEE 258H", route: "Route D", capacity: 33, availability: "Available" },
];

export function getVehiclesByRoute(routeName) {
  return vehicles.filter((vehicle) => vehicle.route === routeName);
}

// Generates a 400x400 SVG image (as a data URI) representing a route.
export function routeImage(route) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${route.color}" />
          <stop offset="100%" stop-color="${route.color}99" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)" />
      <circle cx="200" cy="200" r="150" fill="rgba(255,255,255,0.12)" />
      <circle cx="200" cy="200" r="100" fill="rgba(255,255,255,0.12)" />
      <text x="50%" y="50%" fill="#ffffff" font-family="Inter, sans-serif"
        font-size="36" font-weight="700" text-anchor="middle" dominant-baseline="middle">
        ${route.name}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
