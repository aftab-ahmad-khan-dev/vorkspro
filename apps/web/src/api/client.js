import request from "./request.js";

export const clientApi = {
  get: (id) => request.get(`client/get/${id}`),
  getActive: () => request.get("client/get-active-client"),
  getStats: () => request.get("client/get-stats"),
  getByFilter: (params) => request.getWithParams("client/get-by-filter", params),
  create: (data) => request.post("client", data),
  update: (id, data) => request.patch(`client/${id}`, data),
  updateStatus: (id, data) => request.patch(`client/update-status/${id}`, data),
};

export default clientApi;
