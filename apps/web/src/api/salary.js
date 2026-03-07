import request from "./request.js";

export const salaryApi = {
  getRecent: (limit = 15) => request.get(`salary-history/recent?limit=${limit}`),
  updateSalary: (data) => request.post("salary-history/update-salary", data),
};
