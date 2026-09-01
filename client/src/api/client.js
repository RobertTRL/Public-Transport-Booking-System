import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "../utils/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          clearTokens();
          return null;
        }

        const data = await response.json();
        const newToken = data.access_token;

        if (!newToken) {
          clearTokens();
          return null;
        }

        setAccessToken(newToken);
        return newToken;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request(path, options = {}, retry = true) {
  const token = getAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      return request(path, options, false);
    }

    clearTokens();
  }

  return response;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.error ||
      data.message ||
      "The request could not be completed.";

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const response = await request(path, options);
  return parseResponse(response);
}

export async function apiGet(path) {
  return apiRequest(path);
}

export async function apiPost(path, body) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPatch(path, body) {
  return apiRequest(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path) {
  return apiRequest(path, {
    method: "DELETE",
  });
}

export async function getCurrentUser(userType = "user") {
  return apiGet(`/api/v1/me?user_type=${userType}`);
}

