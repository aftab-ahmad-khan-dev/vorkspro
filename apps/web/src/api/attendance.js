import request from "./request.js";

export const attendanceApi = {
  mark: (data) => request.post("attendance/mark", data),
  update: (id, data) => request.patch(`attendance/update/${id}`, data),
  import: (formData) => request.post("attendance/import", formData),
  delete: (id) => request.delete(`attendance/delete/${id}`),
  getWeeklyStatics: () => request.get("attendance/get-weekly-statics"),
  getByFilter: (params) => request.getWithParams("attendance/get-by-filter", params),
  getStats: (date) => request.get(`attendance/get-stats/${date}`),
};
