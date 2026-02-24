import { Router } from "express";
import { clientController } from "../controllers/client.controller.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { multerMultipleUploadRoute } from "../services/file.service2.js";

const route = Router();

route.post(
  "/",
  checkPermission({
    modules: ["Client Management"],
    actions: ["Create Records"],
  }),
  multerMultipleUploadRoute,
  clientController.createClient
);

route.patch(
  "/:id",
  checkPermission({
    modules: ["Client Management"],
    actions: ["Edit Records"],
  }),
  multerMultipleUploadRoute,
  clientController.updateClient
);

route.patch(
  "/update-status/:id",
  checkPermission({
    modules: ["Client Management"],
    actions: ["Edit Records"],
  }),
  clientController.updateClientStatus
);

route.get(
  "/get/:id",
  checkPermission({
    modules: ["Client Management"],
    actions: ["View Records"],
  }),
  clientController.getClientById
);

route.get(
  "/get-by-filter",
  checkPermission({
    modules: ["Client Management"],
    actions: ["View Records"],
  }),
  clientController.getClientsByFilter
);
route.get(
  "/get-stats",
  checkPermission({
    modules: ["Client Management"],
    actions: ["View Records"],
  }),
  clientController.getStats
);

route.get(
  "/get-active-client",
  checkPermission({
    modules: ["Client Management"],
    actions: ["View Records"],
  }),
  clientController.getActiveClient
);

route.get(
  "/communication-history/:id",
  checkPermission({
    modules: ["Client Management"],
    actions: ["View Records"],
  }),
  clientController.getCommunicationHistory
);

export default route;
