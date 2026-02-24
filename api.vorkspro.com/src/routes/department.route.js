import { Router } from "express";
import { departmentController } from "../controllers/department.controller.js";

const route = Router();

route.post(
    "/create",
    departmentController.createDepartment
);

route.patch(
    "/update/:id",
    departmentController.updateDepartment
);

route.delete(
    "/delete/:id",
    departmentController.deleteDepartment
);

route.get(
    "/get-by-filter",
    departmentController.getByFilterDepartment
);

route.get(
    "/get-all",
    departmentController.getAll
);

route.patch(
    "/change-status/:id",
    departmentController.changeStatus
);

route.get(
    '/get-active-departments',
    departmentController.getActiveDepartments
);

route.get(
    '/get-active-list',
    departmentController.getActiveList
);

export default route;