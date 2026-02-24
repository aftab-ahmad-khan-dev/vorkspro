import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller.js";

const route = Router();

route.post("/create", transactionController.createTransaction);
route.post("/update/:id", transactionController.updateTransaction);
route.post("/delete/:id", transactionController.deleteTransaction);
route.post("/get-all", transactionController.getTransactions);

export default route;