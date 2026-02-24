import { Router } from "express";
import { transactionTypeController } from "../controllers/transactionType.controller.js";
import { validate } from "../middlewares/validators.middleware.js";

const route = Router();

route.get(
    "/get-by-filter",
    transactionTypeController.getByFilter
);

route.post(
    "/create",
    transactionTypeController.create
);

route.patch(
    "/update/:id",
    transactionTypeController.update
);

route.delete(
    "/delete/:id",
    transactionTypeController.delete
);

route.get(
    "/get-active-list",
    // validate(["type"], "query"),
    transactionTypeController.getActiveList
);

route.get(
    "/get-all",
    // validate(["type"], "query"),
    transactionTypeController.getAll
);

export default route;