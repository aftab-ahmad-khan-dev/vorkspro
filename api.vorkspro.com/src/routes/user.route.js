import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { User } from "../startup/models.js";
import { asyncHandler } from "../services/asynchandler.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const route = Router();

route.post(
    "/register",
    userController.registerUser
);

route.post(
    "/login",
    userController.loginUser
);

route.post(
    "/refresh-token",
    userController.refreshToken
);

route.post(
    "/forgot-password",
    userController.forgotPassword
);

route.post(
    "/verify-reset-code",
    userController.verifyResetCode
);

route.post(
    "/reset-password",
    userController.resetPassword
);

route.get(
    "/get-roles",
    userController.getRoles
);

route.post(
    "/assign-default-role",
    userController.assignDefaultRole
);

route.get(
    "/me",
    userController.getMe
);

route.patch(
    "/profile",
    userController.updateProfile
);

route.get(
    "/list",
    checkPermission({ actions: ["Access Settings"] }),
    userController.listUsers
);

route.patch(
    "/:id/role",
    checkPermission({ actions: ["Access Settings"] }),
    userController.updateUserRole
);

route.post("/save-player-id", asyncHandler(async (req, res) => {
    console.log("Saving playerId for user:", req.user?._id);
    const { playerId } = req.body;
    if (!playerId) {
        return res.status(400).json({ message: "playerId required" });
    }
    await User.findByIdAndUpdate(req.user._id, {
        oneSignalPlayerId: playerId
    });
    res.json({ isSuccess: true });
}));



export default route;