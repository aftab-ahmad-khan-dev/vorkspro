/**
 * Centralized API layer - all API calls live here.
 * Pages import from @/api and call domain-specific methods.
 */
import api from "./axios.js";
import request from "./request.js";

export { default as api } from "./axios.js";
export { default as request } from "./request.js";
export { API_KEY, BASE_URL } from "./axios.js";

export { authApi } from "./auth.js";
export { userApi } from "./user.js";
export { configApi } from "./config.js";
export { employeeApi } from "./employee.js";
export { projectApi } from "./project.js";
export { clientApi } from "./client.js";
export { milestoneApi } from "./milestone.js";
export { credentialApi } from "./credential.js";
export { categoryApi } from "./category.js";
export { roleApi } from "./role.js";
export { announcementApi } from "./announcement.js";
export { leaveRequestApi } from "./leaveRequest.js";
export { attendanceApi } from "./attendance.js";
export { transactionApi } from "./transaction.js";
export { todoApi } from "./todo.js";
export { followupApi } from "./followup.js";
export { blockageApi } from "./blockage.js";
export { adminAssetsApi } from "./adminAssets.js";
export { knowledgeApi } from "./knowledge.js";
export { automationApi } from "./automation.js";
export { salaryApi } from "./salary.js";

// Backward-compatible helpers (use axios instance)
export const apiGet = (endpoint) => request.get(endpoint);
export const apiGetByFilter = (endpoint, params = {}) => request.getWithParams(endpoint, params);
export const apiPost = (endpoint, data = {}) => request.post(endpoint, data);
export const apiPut = (endpoint, data = {}) => request.put(endpoint, data);
export const apiPatch = (endpoint, data = {}) => request.patch(endpoint, data);
export const apiDelete = (endpoint, data = {}) => request.delete(endpoint, data);
