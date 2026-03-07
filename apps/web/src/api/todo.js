import request from "./request.js";

export const todoApi = {
  getAll: () => request.get("todo/get-all"),
  getPrevious: () => request.get("todo/get-previous"),
  getStats: () => request.get("todo/get-stats"),
  create: (data) => request.post("todo/create", data),
  update: (id, data) => request.patch(`todo/update/${id}`, data),
  delete: (id) => request.delete(`todo/delete/${id}`),
};
