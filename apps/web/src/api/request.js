/**
 * Request helpers using the centralized axios instance.
 * All requests automatically include X-API-Key and auth token.
 */
import api from "./axios.js";

export const request = {
  get: (endpoint, config) =>
    api.get(endpoint, config).then((r) => r.data),

  getWithParams: (endpoint, params = {}, config) =>
    api.get(endpoint, { params, ...config }).then((r) => r.data),

  post: (endpoint, data = {}, config) =>
    api.post(endpoint, data, config).then((r) => r.data),

  put: (endpoint, data = {}, config) =>
    api.put(endpoint, data, config).then((r) => r.data),

  patch: (endpoint, data = {}, config) =>
    api.patch(endpoint, data, config).then((r) => r.data),

  delete: (endpoint, data = {}, config) =>
    api.delete(endpoint, { data, ...config }).then((r) => r.data),

  /** Fetch as blob (for file downloads). url can be full URL or relative endpoint. */
  download: (url, config) =>
    api.get(url, { responseType: "blob", ...config }).then((r) => r.data),
};

export default request;
