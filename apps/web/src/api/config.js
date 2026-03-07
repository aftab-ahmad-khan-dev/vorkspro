import request from "./request.js";

export const configApi = {
  getCompany: () => request.get("config/company"),
  updateCompany: (data) => request.patch("config/company", data),
};

export default configApi;
