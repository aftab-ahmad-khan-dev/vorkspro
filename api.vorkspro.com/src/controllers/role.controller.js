import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Role } from "../startup/models.js";
import { client } from "../app.js";
import { CACHE_KEYS, invalidateCache } from "../services/cache.service.js";

const MODULES = [
    "Dashboard",
    "Employee Management",
    "Employees",
    "Attendance",
    "Performance",
    "Payroll",
    "Project Management",
    "Projects",
    "Milestones",
    "Client Management",
    "Follow-up-Hub",
    "Finance",
    "HR Management",
    "My To-Do Hub",
    "Reports & Analytics",
    "Admin & Assets",
    "Knowledge Base",
    "Announcements",
    "Categories",
    "Settings",
    "Blockages",
    "Keys & Credentials",
    "Categories"
];

const ACTIONS = [
    "Create Records",
    "Edit Records",
    "Delete Records",
    "Change Status",
    "Toggle Active/Inactive",
    "Export Data",
    "Manage Users",     // like update employee salary
    "Process Payroll",
    "View Finance",
    "Access Settings",
    "View Records",
    "Filter Records",
    "View Details"
];

const TABS = [
    // Employee details tabs
    "Salary&Compensation",
    "Assigned Projects",
    "Attendance",
    "Assigned Assets",
    // Projects details tabs
    "Overview",
    "Team",
    "Activity",
    "Milestones",
    "Documents",
    "Blockages",
    "Credentials&Keys",
    "Budget Breakdown",
    // Milestones details tabs
    "Team Members",
    "Notes",
    // Clients details tabs
    "Overview",
    "Projects",
    "Documents",
    "Notes",
    // Other tabs
    "Milestones",
    "Calender View",
    "Schedule Follow-up",
    "Communication History",
    "My Follow-ups",
    "Leave Requests",
    "Holidays",
    "Departments",
    "Sub Departments",
    "Transection Types",
    "Leave Types",
    "Document Types",
    "Industry Types",
    "Preferences",
    "Company Info",
    "Role & Management",
    "Configuration",
]

export const roleController = {
    createRole: asyncHandler(async (req, res) => {
        const { name, description, modulePermissions, globalActionPermissions } = req.body;
        const user = req.user._id;

        // Validate that module names are from allowed list
        const invalidModule = modulePermissions?.some(
            (perm) => !MODULES.includes(perm.module)
        );
        if (invalidModule) {
            return generateApiResponse(
                res,
                StatusCodes.BAD_REQUEST,
                false,
                "Invalid module name"
            );
        }

        const role = await Role.create({
            name,
            description,
            modulePermissions: modulePermissions || [],
            globalActionPermissions: globalActionPermissions || [],
        });

        await client.del(`user:${user}:role`);
        await invalidateCache(CACHE_KEYS.ROLES_ACTIVE);
        return generateApiResponse(
            res,
            StatusCodes.CREATED,
            true,
            "Role created successfully",
            { role }
        );
    }),

    getRoles: asyncHandler(async (req, res) => {
        const roles = await Role.find();

        return generateApiResponse(res, StatusCodes.OK, true, "Roles fetched successfully", { roles });
    }),

    deleteRole: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const role = await Role.findByIdAndDelete(id);

        if (!role) {
            return generateApiResponse(res, StatusCodes.CONFLICT, false, "Role not found");
        }
        await invalidateCache(CACHE_KEYS.ROLES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, "Role deleted successfully");
    }),

    updateRole: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = req.user._id;
        const { name, description, modulePermissions, globalActionPermissions } = req.body;

        // Optional: validate modules again
        if (modulePermissions) {
            const invalidModule = modulePermissions.some(
                (perm) => !MODULES.includes(perm.module)
            );
            if (invalidModule) {
                return generateApiResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    false,
                    "Invalid module name"
                );
            }
        }

        const role = await Role.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(modulePermissions && { modulePermissions }),
                ...(globalActionPermissions !== undefined && { globalActionPermissions }),
            },
            { new: true, runValidators: true }
        );

        if (!role) {
            return generateApiResponse(
                res,
                StatusCodes.NOT_FOUND,
                false,
                "Role not found"
            );
        }
        await client.del(`user:${user}:role`);
        await invalidateCache(CACHE_KEYS.ROLES_ACTIVE);
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Role updated successfully",
            { role }
        );
    }),

    toggleRoleStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { isActive } = req.body;

        console.log("isActive: ", isActive);

        const role = await Role.findById(id);
        if (!role) {
            return generateApiResponse(res, StatusCodes.CONFLICT, false, "Role not found");
        }

        role.isActive = isActive;
        await role.save();
        await invalidateCache(CACHE_KEYS.ROLES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, "Role status toggled successfully", { role });
    }),

    getActiveRoles: asyncHandler(async (req, res) => {
        // 1️⃣ Check Redis (cache is invalidated on every role mutation, so no stale data)
        const cachedRoles = await client.get(CACHE_KEYS.ROLES_ACTIVE);

        if (cachedRoles) {
            console.log("Roles served from Redis");
            return generateApiResponse(
                res,
                StatusCodes.OK,
                true,
                "Active roles fetched successfully (cache)",
                { roles: JSON.parse(cachedRoles) }
            );
        }

        // 2️⃣ Fetch from DB and repopulate cache
        console.log("Roles served from Database");
        const roles = await Role.find({ isActive: true }).select("name");
        await client.set(
            CACHE_KEYS.ROLES_ACTIVE,
            JSON.stringify(roles),
            { EX: 600 } // fallback TTL only; any mutation invalidates immediately
        );

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Active roles fetched successfully",
            { roles }
        );
    }),

    toggleBudget: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { cost } = req.body;

        const role = await Role.findById(id);
        if (!role) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Role not found");
        }

        role.cost = cost;
        await role.save();
        await invalidateCache(CACHE_KEYS.ROLES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, "cost updated successfully", );
    }),
}
