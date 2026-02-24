import { Router } from "express";
import { knowledgeController } from "../controllers/knowledge.controller.js";
import { multerMultipleUploadRoute } from "../services/file.service2.js";

const route = Router();

route.post('/upload', multerMultipleUploadRoute, knowledgeController.createKnowledge)
route.patch('/update/:id', multerMultipleUploadRoute, knowledgeController.updateKnowledge)
route.delete('/delete/:id', knowledgeController.deleteKnowledge)
route.get('/get-list', knowledgeController.getKnowledge)

export default route;