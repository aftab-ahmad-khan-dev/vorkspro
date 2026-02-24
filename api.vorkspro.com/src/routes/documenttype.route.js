import { Router } from "express";
import { documentTypeController } from "../controllers/documenttype.controller.js";

const route = Router();

route.post('/create', documentTypeController.create)
route.patch('/update/:id', documentTypeController.update)
route.delete('/delete/:id', documentTypeController.delete)
route.get('/get-by-filter', documentTypeController.getByFilter)
route.get('/get-all', documentTypeController.getAll)
route.patch('/change-status/:id', documentTypeController.changeStatus)
route.get(
    '/get-active-list',
    documentTypeController.getActiveList
);

export default route;