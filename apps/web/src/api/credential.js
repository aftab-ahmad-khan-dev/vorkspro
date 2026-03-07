import request from "./request.js";

export const credentialApi = {
  getByProject: (projectId) => request.get(`credential/get-by-project/${projectId}`),
  create: (projectId, data) => request.post(`credential/create/${projectId}`, data),
  update: (projectId, data) => request.patch(`credential/update/${projectId}`, data),
  deleteByProject: (projectId, data) => request.delete(`credential/delete/${projectId}`, data),
  deleteById: (credentialId) => request.delete(`credential/delete/${credentialId}`),
};
