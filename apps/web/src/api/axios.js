/**
 * Centralized Axios instance for all API requests.
 * Ensures X-API-Key, Authorization, and refresh-token logic on every request.
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const API_KEY = import.meta.env.VITE_APP_API_KEY?.trim();

if (!BASE_URL && import.meta.env.DEV) {
  console.warn(
    "VITE_APP_BASE_URL is not set in .env — API requests will fail. Use e.g. http://localhost:4000/api/"
  );
}

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Platform": "web",
    ...(API_KEY && { "X-API-Key": API_KEY }),
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (API_KEY) {
      config.headers["X-API-Key"] = API_KEY;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (err) => Promise.reject(err)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      // Handle 403 "no role" toast once
      if (error.response?.status === 403) {
        const msg = error.response?.data?.message || "";
        const isNoRole =
          msg.includes("No role assigned to the user") ||
          msg.includes("Your role is inactive or invalid");
        if (isNoRole) {
          try {
            const { toast } = await import("sonner");
            toast.error(
              "Your account has no role assigned or your role is inactive. Please contact your administrator.",
              { duration: 8000 }
            );
          } catch (_) {}
        }
      }
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        `HTTP ${error.response?.status || 500}`;
      return Promise.reject(new Error(errMsg));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(new Error("Refresh token missing"));
    }

    try {
      const { data } = await axios.post(
        `${BASE_URL}user/refresh-token`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            ...(API_KEY && { "X-API-Key": API_KEY }),
          },
        }
      );
      const newToken = data.token;
      localStorage.setItem("token", newToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return instance(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
export { API_KEY, BASE_URL };
