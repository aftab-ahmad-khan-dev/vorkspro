/**
 * Role templates for Settings → Role & Management.
 * Same structure as landing "By Role" section. Used to prefill Add Role (review & modify, then save).
 */
const DEFAULT_ACTIONS = ["View Records", "Create Records", "Edit Records", "Delete Records", "Export Data", "View Details"];
const SETTINGS_TABS = ["Preferences", "Company Info", "Role & Management"];

function mod(name, actions = DEFAULT_ACTIONS, tabs = [], detailTabs = []) {
  return { module: name, actions, tabs, detailTabs };
}

export const ROLE_TEMPLATES = [
  {
    id: "admin",
    label: "Admin",
    desc: "Full access to dashboards, employees, projects, finance, HR, and settings.",
    name: "Admin",
    description: "Full access to all modules and actions.",
    modulePermissions: [
      mod("Dashboard"),
      mod("Employees"), mod("Attendance"), mod("Performance"), mod("Payroll"),
      mod("Projects"), mod("Milestones"), mod("Blockages"), mod("Keys & Credentials"),
      mod("Client Management"), mod("Follow-up-Hub"), mod("Finance"), mod("HR Management"),
      mod("My To-Do Hub"), mod("Reports & Analytics"), mod("Admin & Assets"),
      mod("Knowledge Base"), mod("Announcements"), mod("Categories"), mod("Automation"),
      mod("Settings", ["Access Settings", "View Records"], SETTINGS_TABS),
    ],
  },
  {
    id: "hr",
    label: "HR Manager",
    desc: "Employee lifecycle, attendance, leave, payroll, and HR policies.",
    name: "HR Manager",
    description: "Manages employee data, payroll, and attendance-related modules.",
    modulePermissions: [
      mod("Dashboard"),
      mod("Employees"), mod("Attendance"), mod("Performance"), mod("Payroll"),
      mod("HR Management"), mod("My To-Do Hub"), mod("Announcements"),
      mod("Settings", ["Access Settings", "View Records"], SETTINGS_TABS),
    ],
  },
  {
    id: "finance",
    label: "Finance",
    desc: "Transactions, payroll, reports, and financial analytics.",
    name: "Finance Officer",
    description: "Handles financial operations, reports, and payroll management.",
    modulePermissions: [
      mod("Dashboard"),
      mod("Finance", ["View Finance", "Create Records", "Edit Records", "Export Data"]),
      mod("Reports & Analytics"), mod("Payroll", ["View Records", "Process Payroll", "Export Data"]),
      mod("My To-Do Hub"), mod("Settings", ["Access Settings", "View Records"], SETTINGS_TABS),
    ],
  },
  {
    id: "pm",
    label: "Project Manager",
    desc: "Projects, milestones, tasks, blockages, and credentials.",
    name: "Project Manager",
    description: "Oversees assigned projects and manages team progress.",
    modulePermissions: [
      mod("Dashboard"),
      mod("Projects"), mod("Milestones"), mod("Blockages"), mod("Keys & Credentials"),
      mod("Client Management"), mod("Follow-up-Hub"), mod("My To-Do Hub"),
      mod("Reports & Analytics"), mod("Settings", ["Access Settings", "View Records"], SETTINGS_TABS),
    ],
  },
  {
    id: "employee",
    label: "Employee",
    desc: "Personal dashboard, to-dos, follow-ups, and knowledge base.",
    name: "Employee",
    description: "Limited access to assigned tasks, attendance, and reports.",
    modulePermissions: [
      mod("Dashboard"),
      mod("My To-Do Hub", ["View Records", "Create Records", "Edit Records", "Change Status"]),
      mod("Follow-up-Hub"), mod("Knowledge Base"), mod("Announcements"),
      mod("Settings", ["Access Settings", "View Records"], ["Preferences"]),
    ],
  },
];
