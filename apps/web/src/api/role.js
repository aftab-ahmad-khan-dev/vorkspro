import request from "./request.js";

export const roleApi = {
  getAll: () => request.get("role/"),
  getActiveRoles: () => request.get("role/get-active-roles"),
  create: (data) => request.post("role/create", data),
  update: (id, data) => request.patch(`role/${id}`, data),
  delete: (id) => request.delete(`role/${id}`),
  toggleStatus: (id) => request.patch(`role/toggle-status/${id}`),
  toggleBudget: (id, cost) => request.patch(`role/toggle-budget/${id}`, { cost }),
};

export default roleApi;
