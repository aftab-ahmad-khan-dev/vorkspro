import { Router } from "express";
import { leaveTypeController } from "../controllers/leavetype.controller.js";

const route = Router();

route.post("/create", leaveTypeController.createLeaveType);

route.patch("/update/:id", leaveTypeController.updateLeaveType);

route.delete("/delete/:id", leaveTypeController.deleteLeaveType);

route.get("/get-by-filter", leaveTypeController.getByFilter);

route.get("/get-all", leaveTypeController.getAll);

route.patch("/change-status/:id", leaveTypeController.changeStatus);

route.get("/get-active-list", leaveTypeController.getActiveList);

route.get("/get-by-id/:id", leaveTypeController.getById);

export default route;
