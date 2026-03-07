import request from "./request.js";

export const employeeApi = {
  getByFilter: (params) => request.getWithParams("employee/get-by-filter", params),
  getActiveEmployees: () => request.get("employee/get-active-employees"),
  getDetail: (id) => request.get(`employee/get-detail/${id}`),
  getStats: () => request.get("employee/get-stats"),
  create: (data) => request.post("employee", data),
  update: (id, data) => request.patch(`employee/${id}`, data),
  delete: (id) => request.delete(`employee/delete/${id}`),
  changeStatus: (id, payload) => request.patch(`employee/change-status/${id}`, payload),
  updateProfile: (data) => request.patch("employee/update-profile", data),
  uploadProfilePhoto: (formData) => request.post("employee/upload-profile-photo", formData),
  getAttendanceEmployees: (date) => request.get(`employee/get-attendance-employees/${date}`),
};

export default employeeApi;
