import { Router } from "express";
import projectKeyController from "../controllers/projectkey.controller.js";

const router = Router();

// CREATE
router.post("/create/:id", projectKeyController.createProjectKey);

// READ - Get all keys
router.get("/get-by-project/:id", projectKeyController.getProjectKeys);

// UPDATE
router.patch("/update/:id", projectKeyController.updateProjectKey);

// DELETE
router.delete("/delete/:id", projectKeyController.deleteProjectKey);

export default router;
