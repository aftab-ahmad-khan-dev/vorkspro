import { Router } from "express";
import { subDepartmentsController } from "../controllers/subdepartment.controller.js";

const route = Router();

route.post("/create", subDepartmentsController.createSubDepartment);

route.patch("/update/:id", subDepartmentsController.updateSubDepartment);

route.delete("/delete/:id", subDepartmentsController.deleteSubDepartment);

route.get("/get-by-filter", subDepartmentsController.getByFilter);

route.get("/get-all", subDepartmentsController.getAll);

export default route;
