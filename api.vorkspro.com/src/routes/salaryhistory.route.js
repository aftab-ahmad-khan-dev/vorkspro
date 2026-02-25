import { Router } from "express";
import { salaryHistoryController } from "../controllers/salaryhistory.controller.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validators.middleware.js";

const route = Router();

route.get(
  "/recent",
  checkPermission({ modules: ["Payroll", "Employees", "Employee Management"] }),
  salaryHistoryController.getRecentSalaryHistory
);

route.post(
    '/update-salary',
    checkPermission({
        modules: ["Employee Management"],
        actions: ["Manage Users"],
    }),
    validate(['employeeId', 'date', 'newSalary']),
    salaryHistoryController.updateEmployeeSalary,
);

export default route;