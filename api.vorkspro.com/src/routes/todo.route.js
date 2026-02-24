import { Router } from "express";
import { todoController } from "../controllers/todo.controller.js";


const route = Router();

route.post("/create", todoController.createTodos);

route.patch("/update/:id", todoController.updateTodos);

route.delete("/delete/:id", todoController.deleteTodos);

route.get("/get-all", todoController.getAllTodos);

route.get("/get-stats", todoController.getStats);

route.get("/get-previous", todoController.getPreviousTodos);
export default route;
