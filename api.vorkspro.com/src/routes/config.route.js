import { Router } from "express";
import * as configController from "../controllers/config.controller.js";

const route = Router();

route.get("/company", configController.getCompany);
route.patch("/company", configController.updateCompany);

export default route;
