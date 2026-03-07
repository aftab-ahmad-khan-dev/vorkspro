import request from "./request.js";

export const milestoneApi = {
  getById: (id) => request.get(`milestone/get-by-id/${id}`),
  getByProject: (projectId) => request.get(`milestone/get-by-project/${projectId}`),
  getByFilter: (params) => request.getWithParams("milestone/get-by-filter", params),
  getByDate: (params) => request.getWithParams("milestone/get-by-date", params),
  getStats: () => request.get("milestone/get-stats"),
  create: (data) => request.post("milestone/create", data),
  update: (id, data) => request.patch(`milestone/update/${id}`, data),
  changeStatus: (id, data) => request.patch(`milestone/change-status/${id}`, data),
  delete: (id) => request.post(`milestone/delete/${id}`),
};

export default milestoneApi;
