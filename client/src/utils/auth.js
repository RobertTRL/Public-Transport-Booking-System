const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://public-transport-booking-system.onrender.com";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setTokens(tokens) {
  if (typeof window === "undefined") return;

  const accessToken = tokens?.access_token;
  const refreshToken = tokens?.refresh_token;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAccessToken() {
  clearTokens();
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

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
  } catch {
    clearTokens();
    return null;
  }
}

export async function fetchWithAuth(url, options = {}) {
  let token = getAccessToken();

  const makeRequest = (accessToken) => {
    const headers = new Headers(options.headers || {});

    headers.set("Accept", "application/json");

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(token);

  if (response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();

  if (!refreshedToken) {
    return response;
  }

  token = refreshedToken;
  response = await makeRequest(token);

  if (response.status === 401) {
    clearTokens();
  }

  return response;
}
