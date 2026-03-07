import request from "./request.js";

export const userApi = {
  getMe: () => request.get("user/me"),
  updateProfile: (data) => request.patch("user/profile", data),
  changePassword: (data) => request.patch("user/change-password", data),
  assignDefaultRole: () => request.post("user/assign-default-role"),
  getRoles: () => request.get("user/get-roles"),
  getList: () => request.get("user/list"),
  assignRole: (userId, role) => request.patch(`user/${userId}/role`, { role }),
  removeRole: (userId) => request.patch(`user/${userId}/role`, { role: null }),
};

export default userApi;
