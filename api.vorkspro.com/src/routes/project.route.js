import { Router } from "express";
import { projectController } from "../controllers/project.controller.js";
import { userController } from "../controllers/user.controller.js";
import { checkPermission } from "../middlewares/permission.middleware.js";
import { multerMultipleUploadRoute } from "../services/file.service2.js";

const route = Router();

route.post(
  "/create",
  checkPermission({
    modules: ["Projects"],
    actions: ["Create Records"],
  }),
  projectController.createProject
);
route.post(
  "/blockage/create",
  checkPermission({
    modules: ["Blockages"],
    actions: ["Create Records"],
  }),
  projectController.createBlockage
);
route.get(
  "/blockage/get",
  checkPermission({
    modules: ["Blockages"],
    actions: ["View Records"],
  }),
  projectController.getBlockagesByProject
);
route.patch(
  "/blockage/update",
  checkPermission({
    modules: ["Blockages"],
    actions: ["Edit Records"],
  }),
  projectController.updateBlockage
);
route.get(
  "/blockage/get-all",
  checkPermission({
    modules: ["Blockages"],
    actions: ["View Records"],
  }),
  projectController.getAllBlockages
);

route.get(
  "/get-by-filter",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getProjectsByFilter
);
route.get(
  "/get-assigned-projects/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getAssignedProjects
);


route.get(
  "/get-all",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getAllProjects
);

route.get(
  "/get-stats",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getProjectStats
);

route.patch(
  "/update/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["Edit Records"],
  }),
  projectController.updateProject
);

route.patch(
  "/change-status/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["Edit Records"],
  }),
  projectController.changeStatus
);

route.delete(
  "/delete/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["Delete Records"],
  }),
  projectController.deleteProject
);

route.get(
  "/get-inprogress",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getInprogressProjects
);
route.get(
  "/get-inprogress-onhold",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getInprogressandOnHoldProjects
);

route.post(
  "/upload-documents/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["Edit Records"],
  }),
  multerMultipleUploadRoute,
  projectController.uploadDocuments
);
route.get(
  "/get-by-id/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getById
);

route.patch(
  '/add-team-members/:id',
  checkPermission({
    modules: ["Projects"],
    actions: ["Edit Records"],
  }),
  projectController.addTeamMembers
)

route.get(
  "/budget-breakdown/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.getBudgetBreakdown
);

route.patch(
  "/update-exchange-rate",
  checkPermission({
    modules: ["Projects"],
    actions: ["Edit Records"],
  }),
  userController.updateExchangeRate
);

route.get(
  "/get-exchange-rate",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  userController.getExchangeRate
);
route.patch(
  "/change-index/:id",
  checkPermission({
    modules: ["Projects"],
    actions: ["View Records"],
  }),
  projectController.changeIndex
);

export default route;
