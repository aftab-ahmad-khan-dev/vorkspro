import { Router } from "express";
import { announcementController } from "../controllers/announcement.controller.js";

const route = Router();

route.post("/create", announcementController.createAnnouncement)
route.patch("/update/:id", announcementController.updateAnnouncement)
route.delete("/delete/:id", announcementController.deleteAnnouncement)
route.patch("/mark-as-read/:id", announcementController.markAsRead)
route.get("/get-all", announcementController.getAllAnnouncements)
route.get("/stats", announcementController.getStats)
route.get("/get-comments/:id", announcementController.getComments)
route.post("/post-comments/:id", announcementController.postComments)

export default route;