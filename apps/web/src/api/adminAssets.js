import request from "./request.js";

export const adminAssetsApi = {
  getByFilter: (params) => request.getWithParams("admin-and-assets/get-by-filter", params),
  getStats: () => request.get("admin-and-assets/get-stats"),
  getById: (id) => request.get(`admin-and-assets/get-by-id/${id}`),
  create: (data) => request.post("admin-and-assets/create", data),
  update: (id, data) => request.patch(`admin-and-assets/update/${id}`, data),
  delete: (id) => request.delete(`admin-and-assets/delete/${id}`),
};
