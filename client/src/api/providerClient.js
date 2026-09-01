const API_BASE_URL = "http://127.0.0.1:5000";

function getAuthHeaders() {
const token = localStorage.getItem("access_token");

return {
"Content-Type": "application/json",
...(token ? { Authorization: `Bearer ${token}` } : {}),
};
}

async function request(url, options = {}) {
const response = await fetch(`${API_BASE_URL}${url}`, {
...options,
headers: {
...getAuthHeaders(),
...(options.headers || {}),
},
});

let data = {};

try {
data = await response.json();
} catch {
// Some successful responses may not contain JSON.
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

export async function listVehicles(params = {}) {
const query = new URLSearchParams(params).toString();

return request(
`/api/v1/provider/vehicles${query ? `?${query}` : ""}`
);
}

export async function listRouteTrips(routeId, params = {}) {
const query = new URLSearchParams(params).toString();

return request(
`/api/v1/provider/routes/${routeId}/trips${query ? `?${query}` : ""}`
);
}

export async function createTrip(routeId, tripData) {
return request(`/api/v1/provider/routes/${routeId}/trips`, {
method: "POST",
body: JSON.stringify(tripData),
});
}

export async function cancelTrip(tripId) {
return request(`/api/v1/provider/trips/${tripId}/cancel`, {
method: "PATCH",
});
}

export async function getTripBookings(tripId, params = {}) {
const query = new URLSearchParams(params).toString();

return request(
`/api/v1/provider/trips/${tripId}/bookings${query ? `?${query}` : ""}`
);
}
