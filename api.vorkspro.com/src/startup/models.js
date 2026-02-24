import initializeDatabase from "../database/database.js";

import Achievement from "../models/achievement.model.js";
import { AdminAndAssets } from "../models/adminandassets.model.js";
import Attendance from "../models/attendance.model.js";
import Announcement from "../models/announcement.model.js";
import BugType from "../models/bugtype.model.js";
import Client from "../models/client.model.js";
import Department from "../models/department.model.js";
import DocumentType from "../models/documenttype.model.js";
import { DocumentManager } from "../models/documentmanager.model.js";
import Employee from "../models/employee.model.js";
import { Followup } from "../models/followup.model.js";
import Industry from "../models/industry.model.js";
import IndustryType from "../models/industry.model.js";
import { Knowledge } from "../models/knowledge.model.js";
import LeaveType from "../models/leavetype.model.js";
import { LeaveRequest } from "../models/leaverequest.model.js";
import Milestone from "../models/milestone.model.js";
import Project from "../models/project.model.js";
import { PolicyAndUpdates } from "../models/policiesandupdates.model.js";
import ResetCode from "../models/resetcode.model.js";
import Role from "../models/role.model.js";
import Salary from "../models/salary.model.js";
import SalaryHistory from "../models/salaryhistory.model.js";
import SubDepartment from "../models/subdepartment.model.js";
import Task from "../models/task.model.js";
import { Timeline } from "../models/timeline.model.js";
import { Todo } from "../models/todo.model.js";
import Transaction from "../models/transaction.model.js";
import TransactionType from "../models/transactiontype.model.js";
import User from "../models/user.model.js";
import { Config } from "../models/config.model.js";

initializeDatabase();

export {
  Achievement,
  AdminAndAssets,
  Attendance,
  BugType,
  Announcement,
  Client,
  Department,
  DocumentType,
  DocumentManager,
  Employee,
  Followup,
  Industry,
  IndustryType,
  Knowledge,
  LeaveRequest,
  LeaveType,
  Milestone,
  Project,
  PolicyAndUpdates,
  ResetCode,
  Role,
  Salary,
  SalaryHistory,
  SubDepartment,
  Task,
  Transaction,
  TransactionType,
  Todo,
  User,
  Timeline,
  Config
};
