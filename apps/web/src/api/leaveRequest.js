import request from "./request.js";

export const leaveRequestApi = {
  getStats: () => request.get("leave-request/get-stats"),
  getByFilter: (params) => request.getWithParams("leave-request/get-by-filter", params),
  getUpcomingCelebration: () => request.get("leave-request/get-upcoming-celebration"),
  addHoliday: (data) => request.post("leave-request/add-holiday", data),
  changeApproval: (id, data) => request.patch(`leave-request/change-approval/${id}`, data),
  bulkDelete: (ids) => request.delete("leave-request/bulk-delete", { ids }),
};
