/**
 * Centralized API helper function using fetch.
 * Reads the JWT auth token from localStorage and automatically adds
 * Authorization: Bearer <token> and application/json headers.
 *
 * @param {string} endpoint - The API endpoint path (e.g. '/api/flights' or '/flights')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} The parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  // Normalize endpoint to start with /api if not present
  const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;

  const token = localStorage.getItem("skystream_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiRequest;
