import request from "./request.js";

const withParams = (endpoint, params) =>
  request.getWithParams(endpoint, params);

export const categoryApi = {
  // Department
  department: {
    getAll: () => request.get("department/get-all"),
    getActiveList: () => request.get("department/get-active-list"),
    getByFilter: (params) => withParams("department/get-by-filter", params),
    create: (data) => request.post("department/create", data),
    update: (id, data) => request.patch(`department/update/${id}`, data),
    delete: (id) => request.delete(`department/delete/${id}`),
    changeStatus: (id) => request.patch(`department/change-status/${id}`),
  },
  // SubDepartment
  subDepartment: {
    getByFilter: (params) => withParams("subdepartment/get-by-filter", params),
    create: (data) => request.post("subdepartment/create", data),
    update: (id, data) => request.patch(`subdepartment/update/${id}`, data),
    delete: (id) => request.delete(`subdepartment/delete/${id}`),
    changeStatus: (id) => request.patch(`subdepartment/change-status/${id}`),
  },
  // Industry
  industry: {
    getAll: () => request.get("industry/"),
    getActiveList: () => request.get("industry/get-active-list"),
    create: (data) => request.post("industry/", data),
    update: (id, data) => request.patch(`industry/${id}`, data),
    delete: (id) => request.delete(`industry/${id}`),
    changeStatus: (id) => request.patch(`industry/change-status/${id}`),
  },
  // LeaveType
  leaveType: {
    getAll: () => request.get("leave-type/get-all"),
    getActiveList: () => request.get("leave-type/get-active-list"),
    getByFilter: (params) => withParams("leave-type/get-by-filter", params),
    getById: (id) => request.get(`leave-type/get-by-id/${id}`),
    create: (data) => request.post("leave-type/create", data),
    update: (id, data) => request.patch(`leave-type/update/${id}`, data),
    delete: (id) => request.delete(`leave-type/delete/${id}`),
    changeStatus: (id) => request.patch(`leave-type/change-status/${id}`),
  },
  // TransactionType (income/expense)
  transactionType: {
    getAll: () => request.get("transaction-type/get-all"),
    getByFilter: (params) => withParams("transaction-type/get-by-filter", params),
    create: (data) => request.post("transaction-type/create", data),
    update: (id, data) => request.patch(`transaction-type/update/${id}`, data),
    delete: (id) => request.delete(`transaction-type/delete/${id}`),
    changeStatus: (id) => request.patch(`transaction-type/change-status/${id}`),
  },
  // BugType
  bugType: {
    getByFilter: (params) => withParams("bug-type/get-by-filter", params),
    create: (data) => request.post("bug-type/create", data),
    update: (id, data) => request.patch(`bug-type/update/${id}`, data),
    delete: (id) => request.delete(`bug-type/delete/${id}`),
    changeStatus: (id) => request.patch(`bug-type/change-status/${id}`),
  },
  // DocumentType
  documentType: {
    getActiveList: () => request.get("document-type/get-active-list"),
    getByFilter: (params) => withParams("document-type/get-by-filter", params),
    create: (data) => request.post("document-type/create", data),
    update: (id, data) => request.patch(`document-type/update/${id}`, data),
    delete: (id) => request.delete(`document-type/delete/${id}`),
    changeStatus: (id) => request.patch(`document-type/change-status/${id}`),
  },
};


export default categoryApi;
