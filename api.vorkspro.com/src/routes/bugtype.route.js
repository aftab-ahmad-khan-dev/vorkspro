import { Router } from "express";
import { bugTypeController } from "../controllers/bugtype.controller.js";

const route = Router();

route.get(
    '/get-by-filter',
    bugTypeController.getByFilter
)

route.get(
    '/get-all',
    bugTypeController.getAll
)

route.post(
    '/create',
    bugTypeController.create
)

route.patch(
    '/update/:id',
    bugTypeController.update
)

route.delete(
    '/delete/:id',
    bugTypeController.delete
)

route.patch(
    '/change-status/:id',
    bugTypeController.changeStatus
);

route.get(
    '/get-active-list',
    bugTypeController.getActiveList
);

export default route;