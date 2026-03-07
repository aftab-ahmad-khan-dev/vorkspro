import request from "./request.js";

export const announcementApi = {
  getAll: () => request.get("announcement/get-all"),
  getStats: () => request.get("announcement/stats"),
  getComments: (id) => request.get(`announcement/get-comments/${id}`),
  create: (data) => request.post("announcement/create", data),
  update: (id, data) => request.put(`announcement/update/${id}`, data),
  postComments: (id, data) => request.post(`announcement/post-comments/${id}`, data),
  markAsRead: (id) => request.patch(`announcement/mark-as-read/${id}`),
  delete: (id) => request.delete(`announcement/delete/${id}`),
};

export default announcementApi;
