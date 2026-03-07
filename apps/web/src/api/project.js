import request from "./request.js";

export const projectApi = {
  getAll: () => request.get("project/get-all"),
  getByFilter: (params) => request.getWithParams("project/get-by-filter", params),
  getById: (id) => request.get(`project/get-by-id/${id}`),
  getStats: () => request.get("project/get-stats"),
  create: (data) => request.post("project/create", data),
  update: (id, data) => request.patch(`project/update/${id}`, data),
  delete: (id) => request.delete(`project/delete/${id}`),
  changeStatus: (id, data) => request.patch(`project/change-status/${id}`, data),
  getAssignedProjects: (employeeId) => request.get(`project/get-assigned-projects/${employeeId}`),
  getInProgress: () => request.get("project/get-inprogress"),
  getInProgressOnHold: () => request.get("project/get-inprogress-onhold"),
  updateCanvas: (id, data) => request.patch(`project/update-canvas/${id}`, data),
  uploadCanvasAttachment: (id, formData) => request.post(`project/upload-canvas-attachment/${id}`, formData),
  uploadDocuments: (projectId, formData) => request.post(`project/upload-documents/${projectId}`, formData),
  changeIndex: (milestoneId, params, data) =>
    request.patch(`project/change-index/${milestoneId}`, data, { params }),
};

export default projectApi;
