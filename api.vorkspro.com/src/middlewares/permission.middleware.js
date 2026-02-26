import { StatusCodes } from "http-status-codes";
import { generateApiResponse } from "../services/utilities.service.js";
import { Role } from "../startup/models.js";

/**
 * Middleware factory to check if the user has required permission(s)
 * @param {Object} options
 * @param {string[]} [options.actions] - List of action permissions to check (e.g., ['Create Records'])
 * @param {string[]} [options.modules] - List of module permissions to check (e.g., ['Employee Management'])
 */
export const checkPermission = ({ actions = [], modules = [] } = {}) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Unauthorized access.");
            }

            if (req.user.isSuperAdmin) return next();

            // User must have a role assigned (e.g. in User.role or via admin). Otherwise all protected routes return 403.
            if (!req.user.role) {
                return generateApiResponse(res, StatusCodes.FORBIDDEN, false, "No role assigned to the user.");
            }

            // Fetch user role
            const role = await Role.findById(req.user.role);
            if (!role || !role.isActive) {
                return generateApiResponse(res, StatusCodes.FORBIDDEN, false, "Your role is inactive or invalid.");
            }

            // Super Admin bypass

            const hasAction = actions.length
                ? actions.some((action) =>
                    role?.modulePermissions?.some(
                        (perm) => perm.actions.includes(action)
                    )
                )
                : true;

            const hasModule = modules.length
                ? modules.some((moduleName) =>
                    role.modulePermissions.some(
                        (perm) => perm.module === moduleName
                    )
                )
                : true;

            if (!hasAction || !hasModule) {
                return generateApiResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    false,
                    "You don't have permission to perform this action."
                );
            }

            next();
        } catch (err) {
            console.error("Permission check failed:", err);
            return generateApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, false, "Permission check error.");
        }
    };
};
