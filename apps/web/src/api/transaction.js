import request from "./request.js";

export const transactionApi = {
  getAll: (data) => request.post("transaction/get-all", data),
  create: (data) => request.post("transaction/create", data),
};
