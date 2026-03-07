export const ProjectName = "Vorks Pro";
export const DB_NAME = "VorksPro";
export const TEST_DB_NAME = "VorksProTest";
export const DEV_DB_NAME = "VorksPro";

const ModelNames = {
  Achievement: { model: "Achievement", db: "achievements" },
  AdminAndAssets: { model: "AdminAndAssets", db: "adminandassets" },
  Attendance: { model: "Attendance", db: "attendances" },
  Announcement: { model: "Announcement", db: "announcements" },
  BugType: { model: "BugType", db: "bugtypes" }, //* Seed
  Client: { model: "Client", db: "clients" },
  DocumentManager: { model: "DocumentManager", db: "documentmanagers" }, //* Seed
  Department: { model: "Department", db: "departments" }, //* Seed
  DocumentType: { model: "DocumentType", db: "documenttypes" }, //* Seed
  Employee: { model: "Employee", db: "employees" },
  Followup: { model: "Followup", db: "followups" },
  Holiday: { model: "Holiday", db: "holidays" },
  Industry: { model: "Industry", db: "industries" }, //* Seed
  Knowledge: { model: "Knowledge", db: "knowledges" },
  LeaveType: { model: "LeaveType", db: "leavetypes" }, //* Seed
  LeaveRequest: { model: "LeaveRequest", db: "leaverequests" },
  Milestone: { model: "Milestone", db: "milestones" },
  Project: { model: "Project", db: "projects" },
  ProjectKey: { model: "ProjectKey", db: "projectkeys" },
  PolicyAndUpdates: { model: "PolicyAndUpdates", db: "policyandupdates" },
  ResetCode: { model: "ResetCode", db: "resetcodes" }, //* Seed
  Role: { model: "Role", db: "roles" }, //* Seed
  Salary: { model: "Salary", db: "salaries" },
  // SubDepartment: { model: "SubDepartment", db: "subdepartments" },
  SalaryHistory: { model: "SalaryHistory", db: "salaryhistories" },
  Task: { model: "Task", db: "tasks" },
  SubDepartment: { model: "SubDepartment", db: "subdepartments" }, //* Seed
  Transaction: { model: "Transaction", db: "transactions" },
  TransactionType: { model: "TransactionType", db: "transactiontypes" }, //* Seed
  Timeline: { model: "Timeline", db: "timelines" },
  Todo: { model: "Todo", db: "todos" }, //* Seed
  User: { model: "User", db: "users" },
  Blockage: { model: "Blockage", db: "blockages" },
  Config: { model: "Config", db: "configs" },
  WorkType: { model: "WorkType", db: "worktypes" },
  AutomationRule: { model: "AutomationRule", db: "automationrules" },
  StatusCategory: { model: "StatusCategory", db: "statuscategories" },
};

export { ModelNames };
