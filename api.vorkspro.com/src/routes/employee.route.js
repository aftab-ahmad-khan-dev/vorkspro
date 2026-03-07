import { Router } from "express";
import { employeeController } from "../controllers/employee.controller.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { multerSingleUploadRoute } from "../services/file.service2.js";

const route = Router();

route.post(
  "/create",
  checkPermission({
    modules: ["Employees"],
    actions: ["Create Records"],
  }),
  employeeController.createEmployee
);

route.patch(
  "/update/:id",
  checkPermission({
    modules: ["Employees"],
    actions: ["Edit Records"],
  }),
  employeeController.updateEmployee
);

route.get(
  "/get-detail/:id",
  checkPermission({
    modules: ["Employees"],
    actions: ["View Records"],
  }),
  employeeController.getEmployeeById
);

route.get(
  "/get-profile",
  checkPermission({
    modules: ["Employees"],
    actions: ["View Records"],
  }),
  employeeController.getProfile
);

route.get(
  "/get-by-filter",
  employeeController.getByFilterEmployee
);

route.patch(
  "/update-profile",
  employeeController.updateProfile
);

route.post(
  "/upload-profile-photo",
  multerSingleUploadRoute,
  employeeController.uploadProfilePhoto
);

route.delete(
  "/delete/:id",
  checkPermission({
    modules: ["Employees"],
    actions: ["Delete Records"],
  }),
  employeeController.deleteEmployee
);

route.patch(
  "/terminate-employee",
  checkPermission({
    modules: ["Employees"],
    actions: ["Edit Records"],
  }),
  employeeController.terminateEmployee
);

route.get(
  "/get-stats",
  checkPermission({
    modules: ["Employees"],
  }),
  employeeController.getEmployeeStats
);

route.get(
  "/get-all",
  checkPermission({
    modules: ["Employees"],
  }),
  employeeController.getAllEmployees
);

route.patch(
  "/restore-employee/:id",
  checkPermission({
    modules: ["Employees"],
    actions: ["Edit Records"],
  }),
  employeeController.restoreArchived
);

route.patch(
  "/change-status/:id",
  checkPermission({
    modules: ["Employees"],
    actions: ["Edit Records"],
  }),
  employeeController.changeStatus
);

route.get(
  "/get-active-employees",
  checkPermission({
    modules: ["Employees"],
  }),
  employeeController.getActiveEmployees
);

route.get(
  "/get-attendance-employees/:date",
  employeeController.getAttendanceEmployees
);

export default route;
