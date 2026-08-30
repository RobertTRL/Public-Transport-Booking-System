// Placeholder API layer. These functions simulate backend calls and will be
// replaced with real HTTP requests once the server endpoints exist.
// Each returns a Promise that resolves to a success payload after a short delay.

function delay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function bookVehicle(vehicle) {
  // TODO: POST /api/bookings with the vehicle id.
  console.log("Booking vehicle:", vehicle);
  await delay();
  return { ok: true, vehicle };
}

export async function createUser(user) {
  // TODO: POST /api/users
  console.log("Creating user:", user);
  await delay();
  return { ok: true, user };
}

export async function createStop(stop) {
  // TODO: POST /api/stops
  console.log("Creating stop:", stop);
  await delay();
  return { ok: true, stop };
}

export async function createVehicle(vehicle) {
  // TODO: POST /api/vehicles
  console.log("Creating vehicle:", vehicle);
  await delay();
  return { ok: true, vehicle };
}

export async function createRoute(route) {
  // TODO: POST /api/routes
  console.log("Creating route:", route);
  await delay();
  return { ok: true, route };
}
