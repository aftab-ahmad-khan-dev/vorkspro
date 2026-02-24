import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

// const MODULES = [
//     "Dashboard",
//     "Projects",
//     "Finance",
//     "QA & Testing",
//     "Employee Management",
//     "Clients",
//     "HR Management",
//     "Reports",
// ];

const MODULES = [
    "Dashboard",
    "Employee Management",
    "Employees",
    "Attendance",
    "Performance",
    "Payroll",
    "Project Management",
    "Projects",
    "Keys & Credentials",
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


const RoleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        modulePermissions: [
            {
                module: {
                    type: String,
                    required: true,
                    enum: MODULES, // your list of modules
                },
                actions: [
                    {
                        type: String,
                        enum: ACTIONS, // your CRUD + other actions
                    },
                ],
                tabs: [
                    {
                        type: String,
                        enum: TABS, // your CRUD + other actions
                    },
                ],
                detailTabs: [
                    {
                        type: String,
                        enum: TABS, // your CRUD + other actions
                    },
                ],
            },
        ],
        actionPermissions: [
            {
                type: String,
                enum: ACTIONS,
            },
        ],
        isActive: { type: Boolean, default: true },
        cost:
                    { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ----------------------
// ✅ Instance Methods
// ----------------------
RoleSchema.methods.hasModulePermission = function (moduleName) {
    return this.modulePermissions?.includes(moduleName);
};

RoleSchema.methods.hasActionPermission = function (actionName) {
    return this.actionPermissions?.includes(actionName);
};

// Shortcut helpers
RoleSchema.methods.hasCreateRecordPermission = function () {
    return this.hasActionPermission("Create Records");
};
RoleSchema.methods.hasEditRecordPermission = function () {
    return this.hasActionPermission("Edit Records");
};
RoleSchema.methods.hasDeleteRecordPermission = function () {
    return this.hasActionPermission("Delete Records");
};
RoleSchema.methods.hasExportDataPermission = function () {
    return this.hasActionPermission("Export Data");
};
RoleSchema.methods.hasManageUsersPermission = function () {
    return this.hasActionPermission("Manage Users");
};
RoleSchema.methods.hasProcessPayrollPermission = function () {
    return this.hasActionPermission("Process Payroll");
};
RoleSchema.methods.hasViewFinancePermission = function () {
    return this.hasActionPermission("View Finance");
};
RoleSchema.methods.hasAccessSettingsPermission = function () {
    return this.hasActionPermission("Access Settings");
};

// ----------------------
// ✅ Static Method (for quick DB check)
// ----------------------
RoleSchema.statics.hasPermission = async function (roleId, permissionName) {
    const role = await this.findById(roleId).lean();
    if (!role) return false;

    return (
        role.actionPermissions?.includes(permissionName) ||
        role.modulePermissions?.includes(permissionName)
    );
};

export default mongoose.model(ModelNames.Role.model, RoleSchema);
