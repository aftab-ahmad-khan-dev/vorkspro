/**
 * Legacy interceptor - re-exports from centralized API layer.
 * All requests use axios with X-API-Key, auth token, and refresh logic.
 * @deprecated Prefer importing from @/api and using domain APIs (userApi, projectApi, etc.)
 */
export {
  apiGet,
  apiGetByFilter,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  API_KEY,
  BASE_URL,
} from "@/api/index.js";

export const getPublicHeaders = () => {
  const h = { "Content-Type": "application/json" };
  const API_KEY = import.meta.env.VITE_APP_API_KEY?.trim();
  if (API_KEY) h["X-API-Key"] = API_KEY;
  return h;
};

export const getAuthHeaders = (data) => {
  const token = localStorage.getItem("token");
  const API_KEY = import.meta.env.VITE_APP_API_KEY?.trim();
  const headers = {
    "X-Client-Platform": "web",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(API_KEY && { "X-API-Key": API_KEY }),
  };
  if (!(data instanceof FormData)) headers["Content-Type"] = "application/json";
  return headers;
};
