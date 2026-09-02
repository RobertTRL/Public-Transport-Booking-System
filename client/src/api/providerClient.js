import { API_BASE_URL } from "./client";

async function request(url, options = {}) {
const token = localStorage.getItem("access_token");

const response = await fetch(`${API_BASE_URL}${url}`, {
...options,
headers: {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
...(options.headers || {}),
},
});

let data = {};

try {
data = await response.json();
} catch {
// Response has no JSON body.
}

if (!response.ok) {
throw new Error(
data?.message ||
data?.error ||
`Request failed with status ${response.status}`
);
}

return data;
}

export async function getRoute(routeId) {
return request(`/api/v1/provider/routes/${routeId}`);
}

export async function listRoutes(params = {}) {
const query = new URLSearchParams(
Object.fromEntries(
Object.entries(params).filter(([, value]) => value !== undefined)
)
).toString();

return request(
`/api/v1/provider/routes${query ? `?${query}` : ""}`
);
}

export async function createRoute(route) {
return request("/api/v1/provider/routes", {
method: "POST",
body: JSON.stringify(route),
});
}

export async function listVehicles(params = {}) {
const query = new URLSearchParams(
Object.fromEntries(
Object.entries(params).filter(([, value]) => value !== undefined)
)
).toString();

return request(
`/api/v1/provider/vehicles${query ? `?${query}` : ""}`
);
}

export async function listRouteTrips(routeId, params = {}) {
const query = new URLSearchParams(
Object.fromEntries(
Object.entries(params).filter(([, value]) => value !== undefined)
)
).toString();

return request(
`/api/v1/provider/routes/${routeId}/trips${query ? `?${query}` : ""}`
);
}

export async function createTrip(routeId, trip) {
return request(`/api/v1/provider/routes/${routeId}/trips`, {
method: "POST",
body: JSON.stringify(trip),
});
}

export async function cancelTrip(tripId) {
return request(`/api/v1/provider/trips/${tripId}/cancel`, {
method: "PATCH",
});
}

export async function getTripBookings(tripId, params = {}) {
const query = new URLSearchParams(
Object.fromEntries(
Object.entries(params).filter(([, value]) => value !== undefined)
)
).toString();

return request(
`/api/v1/provider/trips/${tripId}/bookings${query ? `?${query}` : ""}`
);
}

export async function updateVehicle(vehicleId, vehicle) {
return request(`/api/v1/provider/vehicles/${vehicleId}`, {
method: "PATCH",
body: JSON.stringify(vehicle),
});
}

export async function deleteVehicle(vehicleId) {
return request(`/api/v1/provider/vehicles/${vehicleId}`, {
method: "DELETE",
});
}
