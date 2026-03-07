import request from "./request.js";

export const blockageApi = {
  getAll: () => request.get("project/blockage/get-all"),
  getByProject: (projectId) => request.getWithParams("project/blockage/get", { projectId }),
  create: (data) => request.post("project/blockage/create", data),
  update: (data) => request.patch("project/blockage/update", data),
};
