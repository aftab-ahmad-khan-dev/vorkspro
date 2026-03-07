import request from "./request.js";

export const knowledgeApi = {
  getList: (params) => request.getWithParams("knowledge/get-list", params || {}),
  upload: (formData) => request.post("knowledge/upload", formData),
  update: (id, formData) => request.patch(`knowledge/update/${id}`, formData),
  delete: (id) => request.delete(`knowledge/delete/${id}`),
  download: (url) => request.download(url),
};
