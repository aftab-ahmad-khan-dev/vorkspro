/**
 * Tour config – sidebar steps + page-specific steps.
 * Each step: { id, title, description } (element selector is #id).
 * Sidebar tour guides through each nav item explaining its functionality.
 */

export const SIDEBAR_STEPS = [
  { id: "driver-sidebar", title: "Navigation Sidebar", description: "The sidebar is your main navigation. Use it to switch between modules. Click the arrow to collapse or expand. Only modules you have access to are shown." },
  { id: "driver-sidebar-dashboard", title: "Dashboard", description: "Your central hub. View stats (employees, projects, clients), project status chart, activity feed, and quick actions to create records. Click any stat card to jump to that module." },
  { id: "driver-sidebar-employees", title: "Employee Management → Employees", description: "View and manage all employees. Add, edit, search, and filter. Click a row to see full details, attendance, performance, and payroll info." },
  { id: "driver-sidebar-attendance", title: "Employee Management → Attendance", description: "Track employee attendance, check-in/check-out, and leave records. View attendance reports and manage time entries." },
  { id: "driver-sidebar-performance", title: "Employee Management → Performance", description: "Performance reviews, goals, and feedback. Set objectives and track employee performance over time." },
  { id: "driver-sidebar-payroll", title: "Employee Management → Payroll", description: "Manage salaries, pay runs, and payroll processing. View and edit salary details." },
  { id: "driver-sidebar-projects", title: "Project Management → Projects", description: "Create and manage projects. View in List, Calendar, or Kanban. Search, filter by status, and click a project for details, milestones, blockages, and team." },
  { id: "driver-sidebar-credentials", title: "Project Management → Keys & Credentials", description: "Secure storage for API keys, passwords, and credentials. Add, edit, and manage sensitive access data." },
  { id: "driver-sidebar-milestones", title: "Project Management → Milestones", description: "Track project milestones and tasks. Switch between Milestones list, Calendar, and Kanban. Drag cards to change status. Filter by project and status." },
  { id: "driver-sidebar-blockages", title: "Project Management → Blockages", description: "Report and resolve project blockages. View in List, Calendar, or Kanban. Track severity, assign owners, and mark as resolved." },
  { id: "driver-sidebar-client-management", title: "Client Management", description: "Manage clients and their contacts. Add clients, view details, and see linked projects." },
  { id: "driver-sidebar-follow-up", title: "Follow-up Hub", description: "Schedule and log client follow-ups. View in List, Calendar, or Kanban. Mark items complete. Track communication history." },
  { id: "driver-sidebar-finance", title: "Finance", description: "Revenue, expenses, and financial overview. Charts and tables for financial metrics." },
  { id: "driver-sidebar-hr-management", title: "HR Management", description: "Manage leave requests, approvals, and HR tasks. View and approve leave applications." },
  { id: "driver-sidebar-my-todo", title: "My To-Do Hub", description: "Personal to-dos and reminders. Create tasks, set due dates, and track completion. View in List, Calendar, or Kanban with drag-and-drop." },
  { id: "driver-sidebar-reports", title: "Reports & Analytics", description: "Generate and export reports. Choose report type, date range, and export format." },
  { id: "driver-sidebar-admin-assets", title: "Admin & Assets", description: "Admin settings and asset inventory. Manage organizational assets and admin configuration." },
  { id: "driver-sidebar-knowledge", title: "Knowledge Base", description: "Browse and search documentation, guides, and articles. Find internal knowledge resources." },
  { id: "driver-sidebar-announcements", title: "Announcements", description: "Create and view company announcements. Pin important updates. View in List, Calendar, or Kanban." },
  { id: "driver-sidebar-categories", title: "Categories", description: "Manage categories and taxonomy (departments, sub-departments, expense types, etc.)." },
  { id: "driver-sidebar-settings", title: "Settings", description: "App preferences, theme, notifications, roles, and permissions." },
  { id: "driver-sidebar-profile", title: "Profile", description: "Your profile. Update personal details, photo, and preferences." },
  { id: "driver-sidebar-logout", title: "Logout", description: "Sign out of your account securely." },
];

/** Page tours: path pattern -> steps. Paths can be exact or prefix. */
export const PAGE_TOURS = {
  "/app/dashboard": [
    { id: "driver-dashboard-summary", title: "Dashboard Summary", description: "Your role-based summary. The dashboard adapts to your permissions." },
    { id: "driver-dashboard-stats", title: "Stats Overview", description: "Live counts for Employees, Projects, Clients, Leave Requests, To-dos. Click any card to view details." },
    { id: "driver-dashboard-quick-links", title: "Quick Links", description: "Shortcuts to your modules. Jump to any page without using the sidebar." },
    { id: "driver-dashboard-project-status", title: "Project Status", description: "Pie chart of project distribution (Completed, In Progress, On Hold, etc.)." },
    { id: "driver-dashboard-activity", title: "Activity Feed", description: "Recent leave requests and upcoming to-do deadlines. Click names for details." },
    { id: "driver-dashboard-quick-actions", title: "Quick Actions", description: "Create employees, projects, clients, reports, invoices, announcements in one click." },
  ],
  "/app/employees": [
    { id: "driver-page-header", title: "Employees", description: "View and manage all employees. Use search and filters. Switch between List and Grid view. Click Add Employee to create records." },
    { id: "driver-main-content", title: "Employee List", description: "Table or card grid of employees. Use filters and sorting. Click rows for details." },
  ],
  "/app/projects": [
    { id: "driver-page-header", title: "Projects", description: "Manage projects. Switch between List, Calendar, and Kanban. Use List/Grid toggle for list view. Search, filter, and create projects." },
    { id: "driver-main-content", title: "Project List", description: "Projects in table or card grid. Create projects and track status. Click for details." },
  ],
  "/app/client-management": [
    { id: "driver-page-header", title: "Client Management", description: "Manage clients. Add clients and view details. Switch between List and Grid view." },
    { id: "driver-main-content", title: "Client List", description: "All clients. Click for details, contacts, and projects." },
  ],
  "/app/finance": [
    { id: "driver-page-header", title: "Finance", description: "Overview of revenue, expenses, and financial data." },
    { id: "driver-main-content", title: "Finance Content", description: "Charts and tables for financial metrics." },
  ],
  "/app/hr-management": [
    { id: "driver-page-header", title: "HR Management", description: "Manage leave requests, approvals, and HR tasks." },
    { id: "driver-main-content", title: "Leave Requests", description: "View and approve leave requests." },
  ],
  "/app/reports": [
    { id: "driver-page-header", title: "Reports & Analytics", description: "Generate and export reports." },
    { id: "driver-main-content", title: "Report Options", description: "Select report type and date range, then export." },
  ],
  "/app/my-todo-list": [
    { id: "driver-page-header", title: "My To-Do Hub", description: "Personal to-dos. Create tasks, set reminders. View in List, Calendar, or Kanban." },
    { id: "driver-main-content", title: "To-Do List", description: "Add, complete, or organize to-dos. Drag in Kanban to update status." },
  ],
  "/app/settings": [
    { id: "driver-page-header", title: "Settings", description: "App preferences, theme, and account settings." },
    { id: "driver-main-content", title: "Settings Panel", description: "Change theme, language, and preferences." },
  ],
  "/app/profile": [
    { id: "driver-page-header", title: "Profile", description: "Your profile information." },
    { id: "driver-main-content", title: "Profile Content", description: "Edit personal info, photo, and preferences." },
  ],
  "/app/announcements": [
    { id: "driver-page-header", title: "Announcements", description: "View and create announcements. List, Calendar, Kanban views." },
    { id: "driver-main-content", title: "Announcements List", description: "Browse and create announcements. Drag to pin/unpin." },
  ],
  "/app/knowledge-base": [
    { id: "driver-page-header", title: "Knowledge Base", description: "Browse and search documentation." },
    { id: "driver-main-content", title: "Articles", description: "Search and read documentation." },
  ],
  "/app/attendance": [
    { id: "driver-page-header", title: "Attendance", description: "Track employee attendance." },
    { id: "driver-main-content", title: "Attendance Records", description: "View and manage attendance data." },
  ],
  "/app/performance": [
    { id: "driver-page-header", title: "Performance", description: "Performance reviews and goals." },
    { id: "driver-main-content", title: "Performance Data", description: "View reviews and goals." },
  ],
  "/app/payroll": [
    { id: "driver-page-header", title: "Payroll", description: "Payroll management and salaries." },
    { id: "driver-main-content", title: "Payroll Data", description: "Manage salaries and pay runs." },
  ],
  "/app/milestones": [
    { id: "driver-page-header", title: "Milestones", description: "Project milestones. List, Calendar, Kanban views. Switch List/Grid for milestones tab." },
    { id: "driver-main-content", title: "Milestone Board", description: "View milestones. Drag in Kanban to change status. Filter by project." },
  ],
  "/app/follow-up-hub": [
    { id: "driver-page-header", title: "Follow-up Hub", description: "Follow up on clients and tasks. List, Calendar, Kanban views." },
    { id: "driver-main-content", title: "Follow-ups", description: "Track and manage follow-ups. Drag to Completed in Kanban." },
  ],
  "/app/admin-&-assets": [
    { id: "driver-page-header", title: "Admin & Assets", description: "Manage admin and assets." },
    { id: "driver-main-content", title: "Assets", description: "View and manage assets." },
  ],
  "/app/categories": [
    { id: "driver-page-header", title: "Categories", description: "Manage categories and taxonomy." },
    { id: "driver-main-content", title: "Category List", description: "Add and organize categories." },
  ],
  "/app/projects/credentials": [
    { id: "driver-page-header", title: "Keys & Credentials", description: "Secure storage for API keys." },
    { id: "driver-main-content", title: "Credentials", description: "Add and manage credentials." },
  ],
  "/app/blockages": [
    { id: "driver-page-header", title: "Blockages", description: "Track project blockages. List, Calendar, Kanban views. List/Grid toggle for list view." },
    { id: "driver-main-content", title: "Blockage List", description: "View and resolve blockages. Drag in Kanban to update status." },
  ],
};

/** Find page tour steps for a path (exact match or longest prefix). */
export function getPageSteps(path) {
  if (PAGE_TOURS[path]) return PAGE_TOURS[path];
  const prefix = Object.keys(PAGE_TOURS).sort((a, b) => b.length - a.length).find((p) => path.startsWith(p));
  return prefix ? PAGE_TOURS[prefix] : [];
}
