const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

/* ===============================
   AUTH HEADER HELPER (UNCHANGED)
================================ */
const getAuthHeaders = (data) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

/* ===============================
   REFRESH TOKEN LOGIC (NEW)
================================ */
let isRefreshing = false;
let retryQueue = [];

const processQueue = (error, token = null) => {
  retryQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve(token);
  });
  retryQueue = [];
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Refresh token missing");

  const response = await fetch(`${BASE_URL}user/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  localStorage.setItem("token", data.token);

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  return data.token;
};

/* ===============================
   FETCH WRAPPER (NEW)
================================ */
const fetchWithRefresh = async (url, options, retry = true) => {
  const response = await fetch(url, options);

  if (response.status !== 401) return response;

  if (!retry) {
    localStorage.clear();
    window.location.href = "/t-portal/login";
    throw new Error("Unauthorized");
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      retryQueue.push({
        resolve: (token) => {
          options.headers.Authorization = `Bearer ${token}`;
          resolve(fetch(url, options));
        },
        reject,
      });
    });
  }

  isRefreshing = true;

  try {
    const newToken = await refreshToken();
    processQueue(null, newToken);

    options.headers.Authorization = `Bearer ${newToken}`;
    return fetch(url, options);
  } catch (err) {
    processQueue(err, null);
    localStorage.clear();
    window.location.href = "/t-portal/login";
    throw err;
  } finally {
    isRefreshing = false;
  }
};

/* ===============================
   RESPONSE HANDLER (UNCHANGED)
================================ */
const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    let errorMessage;
    try {
      const errorData = JSON.parse(text);
      errorMessage =
        errorData.message ||
        `HTTP ${response.status}: ${text.substring(0, 100)}`;
    } catch {
      errorMessage = `HTTP ${response.status}: ${text.substring(0, 100)}`;
    }
    throw new Error(errorMessage);
  }
  return await response.json();
};

/* ===============================
   APIs (SAME NAMES, SAME USAGE)
================================ */

// GET
export const apiGet = async (endpoint) => {
  const response = await fetchWithRefresh(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// GET By Filter
export const apiGetByFilter = async (endpoint, filterParams = {}) => {
  const queryString = new URLSearchParams(filterParams).toString();

  const response = await fetchWithRefresh(
    `${BASE_URL}${endpoint}?${queryString}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

// POST
export const apiPost = async (endpoint, data = {}) => {
  const response = await fetchWithRefresh(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(data),
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

  return handleResponse(response);
};

// PUT
export const apiPut = async (endpoint, data = {}) => {
  const response = await fetchWithRefresh(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

// PATCH
export const apiPatch = async (endpoint, data = {}) => {
  const response = await fetchWithRefresh(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: getAuthHeaders(data),
    body: data instanceof FormData ? data : JSON.stringify(data),
  });

  return handleResponse(response);
};

// DELETE
export const apiDelete = async (endpoint, data = {}) => {
  const response = await fetchWithRefresh(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};
