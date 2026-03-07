import { Router } from "express";
import { automationController } from "../controllers/automation.controller.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const route = Router();

route.get(
  "/work-types",
  checkPermission({ modules: ["Automation"], actions: ["View Records"] }),
  automationController.getWorkTypes
);
route.get(
  "/work-types/all",
  checkPermission({ modules: ["Automation"], actions: ["View Records"] }),
  automationController.getAllWorkTypes
);
route.post(
  "/work-types",
  checkPermission({ modules: ["Automation"], actions: ["Create Records"] }),
  automationController.createWorkType
);
route.patch(
  "/work-types/:id",
  checkPermission({ modules: ["Automation"], actions: ["Edit Records"] }),
  automationController.updateWorkType
);
route.delete(
  "/work-types/:id",
  checkPermission({ modules: ["Automation"], actions: ["Delete Records"] }),
  automationController.deleteWorkType
);

route.get(
  "/rules",
  checkPermission({ modules: ["Automation"], actions: ["View Records"] }),
  automationController.getRules
);
route.post(
  "/rules",
  checkPermission({ modules: ["Automation"], actions: ["Create Records"] }),
  automationController.createRule
);
route.patch(
  "/rules/:id",
  checkPermission({ modules: ["Automation"], actions: ["Edit Records"] }),
  automationController.updateRule
);
route.delete(
  "/rules/:id",
  checkPermission({ modules: ["Automation"], actions: ["Delete Records"] }),
  automationController.deleteRule
);

route.get(
  "/projects",
  checkPermission({ modules: ["Automation"], actions: ["View Records"] }),
  automationController.getProjectsWithActions
);

route.get(
  "/entity-statuses",
  checkPermission({ modules: ["Automation"], actions: ["View Records"] }),
  automationController.getEntityStatuses
);

route.get(
  "/status-categories",
  checkPermission({ modules: ["Automation"], actions: ["View Records"] }),
  automationController.getStatusCategories
);
route.post(
  "/status-categories",
  checkPermission({ modules: ["Automation"], actions: ["Create Records"] }),
  automationController.createStatusCategory
);
route.patch(
  "/status-categories/:id",
  checkPermission({ modules: ["Automation"], actions: ["Edit Records"] }),
  automationController.updateStatusCategory
);
route.delete(
  "/status-categories/:id",
  checkPermission({ modules: ["Automation"], actions: ["Delete Records"] }),
  automationController.deleteStatusCategory
);

export default route;
