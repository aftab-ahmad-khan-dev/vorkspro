import { Router } from "express";
import { adminAndAssetsController } from "../controllers/adminandassets.controller.js";

const route = Router();

// admin and assets
route.post("/create", adminAndAssetsController.createAdminAndAssets)
route.patch("/update/:id", adminAndAssetsController.updateAdminAndAssets)
route.delete("/delete/:id", adminAndAssetsController.deleteAdminAndAssets)
route.get("/get-by-filter", adminAndAssetsController.getAdminAndAssetsByFilter)
route.get("/get-stats", adminAndAssetsController.getStats)
route.get("/get-by-id/:id", adminAndAssetsController.getById)

// document manager
// route.post("/create-document", adminAndAssetsController.uploadDocument)
// route.patch("/update-document/:id", adminAndAssetsController.updateDocument)
// route.delete("/delete-document/:id", adminAndAssetsController.deleteDocument)
// route.get("/get-document-by-filter", adminAndAssetsController.getDocumentsByFilter)

// policy and updates
// route.post("/create-policy", adminAndAssetsController.createPoliciesAndUpdates)
// route.patch("/update-policy/:id", adminAndAssetsController.updatePoliciesAndUpdates)
// route.delete("/delete-policy/:id", adminAndAssetsController.deletePoliciesAndUpdates)
// route.get("/get-policy-by-filter", adminAndAssetsController.getPoliciesAndUpdatesByFilter)
export default route;