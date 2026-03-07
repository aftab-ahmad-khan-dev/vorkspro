import request from "./request.js";

export const followupApi = {
  getStats: () => request.get("followup/get-stats"),
  getByFilter: (params) => request.getWithParams("followup/get-by-filter", params),
  schedule: (data) => request.post("followup/schedule-followup", data),
  update: (id, data) => request.patch(`followup/update/${id}`, data),
  log: (data) => request.post("followup/log-followup", data),
  markComplete: (id) => request.patch(`followup/mark-complete/${id}`),
};
