import { Router } from "express";
import { roleController } from "../controllers/role.controller.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const route = Router();

route.post(
    '/create',
    checkPermission({
        actions: ["Access Settings"],
    }),
    roleController.createRole,
);
route.get(
    '/',
    // checkPermission({
    //     actions: ["Access Settings"],
    // }),
    roleController.getRoles,
);
route.delete(
    '/:id',
    checkPermission({
        actions: ["Access Settings"],
    }),
    roleController.deleteRole,
);
route.patch(
    '/:id',
    // checkPermission({
    //     actions: ["Access Settings"],
    // }),
    roleController.updateRole,
);
route.patch(
    '/toggle-status/:id',
    checkPermission({
        actions: ["Access Settings"],
    }),
    roleController.toggleRoleStatus,
);
route.get(
    '/get-active-roles',
    checkPermission({
        actions: ["Access Settings"],
    }),
    roleController.getActiveRoles,
)
route.patch(
    '/toggle-budget/:id',
    checkPermission({
        actions: ["Access Settings"],
    }),
    roleController.toggleBudget,
)

export default route;
