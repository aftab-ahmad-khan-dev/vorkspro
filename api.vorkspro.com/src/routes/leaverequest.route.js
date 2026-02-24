import { Router } from "express";
import { leaveRequestController } from "../controllers/leaverequest.controller.js";

const route = Router();

route.post("/create", leaveRequestController.createRequest);
route.patch(
  "/change-approval/:id",
  leaveRequestController.changeApprovalRequest
);
route.delete("/delete/:id", leaveRequestController.deleteRequest);
route.get("/get-by-filter", leaveRequestController.getByFilter);
route.get("/get-stats", leaveRequestController.getStats);
route.get(
  "/get-upcoming-celebration",
  leaveRequestController.getUpComingCelebrations
);
route.post("/add-holiday", leaveRequestController.createHoliday);
route.delete("/bulk-delete", leaveRequestController.bulkDelete);

export default route;
