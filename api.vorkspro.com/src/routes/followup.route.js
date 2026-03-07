import { Router } from "express";
import { followupController } from "../controllers/followup.controller.js";

const route = Router();

route.post('/log-followup', followupController.logCommunity);
route.post('/schedule-followup', followupController.createSchedule);
route.patch('/update/:id', followupController.update);
route.get('/get-by-filter', followupController.getByFilter);
route.get('/get-by-id/:id', followupController.getById);
route.get('/get-stats', followupController.getStats);
route.patch('/mark-complete/:id', followupController.markComplete);

export default route;