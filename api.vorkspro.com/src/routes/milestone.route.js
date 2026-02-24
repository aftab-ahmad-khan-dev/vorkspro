import { Router } from "express";
import { milestoneController } from "../controllers/milestone.controller.js";

const route = Router();

route.post("/create", milestoneController.create);
route.get("/get-by-filter", milestoneController.getByFilter);
route.get("/get-by-id/:id", milestoneController.getById);
route.get("/get-stats", milestoneController.getStats);
route.get("/get-by-date", milestoneController.getMilestoneByDate);
route.get("/get-all", milestoneController.getAll);
route.get("/get-by-project/:id", milestoneController.getMilestoneByProject);
route.patch("/update/:id", milestoneController.update);
route.patch("/change-status/:id", milestoneController.changeStatus);
route.post("/delete/:id", milestoneController.delete);

export default route;
