const API_BASE_URL = "http://127.0.0.1:5000";

const apiClient = {
  async request(method, url, options = {}) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(options.headers || {}),
      },
      body: options.body
        ? JSON.stringify(options.body)
        : undefined,
    });

    let data;

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`
      );

      error.response = {
        status: response.status,
        data,
      };

      throw error;
    }

    return {
      data,
      status: response.status,
    };
  },

  get(url, options = {}) {
    const query = options.params
      ? `?${new URLSearchParams(options.params).toString()}`
      : "";

    return this.request("GET", `${url}${query}`, options);
  },

  post(url, body) {
    return this.request("POST", url, { body });
  },

  patch(url, body) {
    return this.request("PATCH", url, { body });
  },

  delete(url) {
    return this.request("DELETE", url);
  },
};

export default apiClient;