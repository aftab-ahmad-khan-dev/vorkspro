import request from "./request.js";

export const automationApi = {
  getWorkTypesAll: () => request.get("automation/work-types/all"),
  getWorkTypes: () => request.get("automation/work-types"),
  createWorkType: (data) => request.post("automation/work-types", data),
  updateWorkType: (id, data) => request.patch(`automation/work-types/${id}`, data),
  deleteWorkType: (id) => request.delete(`automation/work-types/${id}`),
  getRules: () => request.get("automation/rules"),
  createRule: (data) => request.post("automation/rules", data),
  updateRule: (id, data) => request.patch(`automation/rules/${id}`, data),
  deleteRule: (id) => request.delete(`automation/rules/${id}`),
  getEntityStatuses: () => request.get("automation/entity-statuses"),
  getProjects: () => request.get("automation/projects"),
  getStatusCategories: () => request.get("automation/status-categories"),
  createStatusCategory: (data) => request.post("automation/status-categories", data),
  updateStatusCategory: (id, data) => request.patch(`automation/status-categories/${id}`, data),
  deleteStatusCategory: (id) => request.delete(`automation/status-categories/${id}`),
};
