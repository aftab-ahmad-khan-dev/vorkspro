/**
 * Dashboard config: module colors, summaries, and dynamic access.
 *
 * Departments and sub-departments are dynamic and created by admin (Categories).
 * What each user sees (stats, modules, pages) is driven by their role's assigned
 * modules (admin sets this when creating/editing roles). In future, access can
 * be tied to department/sub-department when the backend supports it.
 */
export const MODULE_COLORS = {
  "Employees": { bg: "bg-violet-500/15", border: "border-violet-500/40", icon: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
  "Projects": { bg: "bg-blue-500/15", border: "border-blue-500/40", icon: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  "Client Management": { bg: "bg-cyan-500/15", border: "border-cyan-500/40", icon: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400" },
  "Reports & Analytics": { bg: "bg-sky-500/15", border: "border-sky-500/40", icon: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
  "Finance": { bg: "bg-emerald-500/15", border: "border-emerald-500/40", icon: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  "Announcements": { bg: "bg-amber-500/15", border: "border-amber-500/40", icon: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  "HR Management": { bg: "bg-teal-500/15", border: "border-teal-500/40", icon: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" },
  "My To-Do Hub": { bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/40", icon: "bg-fuchsia-500", text: "text-fuchsia-600 dark:text-fuchsia-400" },
  "Follow-up-Hub": { bg: "bg-rose-500/15", border: "border-rose-500/40", icon: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  "Admin & Assets": { bg: "bg-indigo-500/15", border: "border-indigo-500/40", icon: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  "Knowledge Base": { bg: "bg-slate-500/15", border: "border-slate-500/40", icon: "bg-slate-500", text: "text-slate-600 dark:text-slate-400" },
  "Categories": { bg: "bg-stone-500/15", border: "border-stone-500/40", icon: "bg-stone-500", text: "text-stone-600 dark:text-stone-400" },
};

/** Default color when module not in map */
export const DEFAULT_MODULE_COLOR = { bg: "bg-[var(--primary)]/15", border: "border-[var(--primary)]/40", icon: "bg-[var(--primary)]", text: "text-[var(--primary)]" };

export function getModuleColor(moduleName) {
  return MODULE_COLORS[moduleName] || DEFAULT_MODULE_COLOR;
}

/**
 * Summary copy for each dashboard type (by route or role).
 * Used as the intro line above stats.
 * For admin-created roles, use role.description or default.
 */
export const DASHBOARD_SUMMARIES = {
  default: "Your workspace overview. Stats and insights are based on the modules your admin assigned to your role (departments and sub-departments are created and managed by admin).",
  admin: "Organization-wide overview: employees, projects, finance, and operations in one place.",
  hr: "HR summary: headcount, attendance, leave requests, and people milestones.",
  finance: "Finance summary: cash flow, inflow, outflow, and pending payments.",
  projectManager: "Projects summary: active projects, milestones, blockages, and team delivery.",
  employee: "Your summary: tasks, attendance, and upcoming deadlines.",
};

/**
 * Dashboard title from role (token/API role object).
 * Use for any role including admin-created ones (e.g. "Finance Officer" → "Finance Officer Dashboard").
 */
export function getDashboardTitleFromRole(role) {
  const name = role?.name;
  if (name && typeof name === "string" && name.trim()) return `${name.trim()} Dashboard`;
  return "Dashboard";
}

/**
 * Dashboard summary from role. Prefer role.description; fallback to default.
 */
export function getDashboardSummaryFromRole(role) {
  const desc = role?.description;
  if (desc && typeof desc === "string" && desc.trim()) return desc.trim();
  return DASHBOARD_SUMMARIES.default;
}

/**
 * Default list of all app modules (for superAdmin when no role modules are set).
 * Departments and sub-departments are dynamic and created by admin; modules/pages
 * assigned to a role (or in future to a department) drive what the user sees.
 */
const ALL_MODULES = [
  "Employees", "Attendance", "Performance", "Payroll",
  "Projects", "Milestones", "Blockages", "Keys & Credentials",
  "Client Management", "Follow-up-Hub", "Finance", "HR Management",
  "My To-Do Hub", "Reports & Analytics", "Admin & Assets",
  "Knowledge Base", "Announcements", "Categories", "Settings",
];

/**
 * Get the list of module names (pages) the user can access from their role.
 * Dynamic: admin creates departments, sub-departments, and roles; role's
 * assigned modules determine what the user sees. No hardcoded department lists.
 */
export function getModulesFromTabs(tabs) {
  if (!tabs) return [];
  if (tabs.isSuperAdmin) return [...ALL_MODULES];
  const perms = tabs.modulePermissions;
  if (!Array.isArray(perms)) return [];
  return perms
    .filter((p) => p && p.module && Array.isArray(p.actions) && p.actions.length > 0)
    .map((p) => p.module.trim());
}

/**
 * Check if the user has a specific action on a module (from their role).
 */
export function hasModuleAction(tabs, moduleName, actionName) {
  if (!tabs) return false;
  if (tabs.isSuperAdmin) return true;
  const perm = tabs.modulePermissions?.find((p) => p && p.module === moduleName);
  return Array.isArray(perm?.actions) && perm.actions.includes(actionName);
}

/**
 * Quick action links for role dashboards. Filter by getModulesFromTabs(tabs)
 * so only modules assigned to the user's role (by admin) are shown.
 * icon: Lucide icon name string — map in component to actual icon.
 */
export const QUICK_ACTION_LINKS = [
  { module: "Employees", label: "Employees", to: "/app/employees", icon: "Users" },
  { module: "Projects", label: "Projects", to: "/app/projects", icon: "FolderKanban" },
  { module: "Client Management", label: "Client Management", to: "/app/client-management", icon: "Briefcase" },
  { module: "Finance", label: "Finance", to: "/app/finance", icon: "DollarSign" },
  { module: "Reports & Analytics", label: "Generate Report", to: "/app/reports", icon: "FileText" },
  { module: "HR Management", label: "HR Management", to: "/app/hr-management", icon: "Calendar" },
  { module: "My To-Do Hub", label: "My To-Do Hub", to: "/app/my-todo-list", icon: "SquareCheckBig" },
  { module: "Follow-up-Hub", label: "Follow-up Hub", to: "/app/follow-up-hub", icon: "MessageSquare" },
  { module: "Announcements", label: "Announcements", to: "/app/announcements", icon: "Bell" },
  { module: "Knowledge Base", label: "Knowledge Base", to: "/app/knowledge-base", icon: "BookOpen" },
  { module: "Payroll", label: "Payroll", to: "/app/payroll", icon: "CreditCard" },
  { module: "Blockages", label: "Blockages", to: "/app/blockages", icon: "AlertTriangle" },
  { module: "Admin & Assets", label: "Admin & Assets", to: "/app/admin-&-assets", icon: "Package" },
];

/** @deprecated Use getModulesFromTabs(tabs) instead. Kept for fallback only. */
export const DASHBOARD_MODULES = {
  admin: ALL_MODULES.slice(),
  hr: ["Employees", "Attendance", "Performance", "Payroll", "HR Management", "Announcements", "My To-Do Hub"],
  finance: ["Finance", "Reports & Analytics", "Payroll", "My To-Do Hub"],
  projectManager: ["Projects", "Milestones", "Client Management", "Follow-up-Hub", "My To-Do Hub"],
  employee: ["My To-Do Hub", "Follow-up-Hub", "Knowledge Base", "Announcements"],
};
