import { Router } from "express";
import { industryTypeController } from "../controllers/industry.controller.js";

const route = Router();

route.post("/", industryTypeController.create);
route.patch("/:id", industryTypeController.update);
route.get("/", industryTypeController.getAll);
route.get("/get-active-list", industryTypeController.getActiveList);
route.delete("/:id", industryTypeController.delete);
route.patch("/change-status/:id", industryTypeController.changeStatus);

export default route;
