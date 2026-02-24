import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";

const route = Router();

route.post("/mark", attendanceController.markAttendance);
route.patch("/update/:id", attendanceController.updateAttendance);
route.get("/get-by-filter", attendanceController.getByFilter);
route.get("/get-stats/:date", attendanceController.getStats);
route.get("/get-weekly-statics", attendanceController.weeklyAttendanceStatic);
route.delete("/delete/:id", attendanceController.deleteAttendance);
route.post("/import", attendanceController.importAttendance);

export default route;
