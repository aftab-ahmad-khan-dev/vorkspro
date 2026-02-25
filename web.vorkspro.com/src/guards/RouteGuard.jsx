import { Navigate, useLocation } from "react-router-dom";
import { useTabs } from "@/context/TabsContext";

const routeModuleMap = {
  "/app/dashboard": "Dashboard",
  "/app/employees": "Employees",
  "/app/attendance": "Attendance",
  "/app/timesheets": "Attendance",
  "/app/performance": "Performance",
  "/app/payroll": "Payroll",
  "/app/projects": "Projects",
  "/app/milestones": "Milestones",
  "/app/client-management": "Client Management",
  "/app/clients": "Client Management",
  "/app/finance": "Finance",
  "/app/hr-management": "HR Management",
  "/app/reports": "Reports & Analytics",
  "/app/follow-up-hub": "Follow-up-Hub",
  "/app/my-todo-list": "My To-Do Hub",
  "/app/admin-&-assets": "Admin & Assets",
  "/app/knowledge-base": "Knowledge Base",
  "/app/announcements": "Announcements",
  "/app/categories": "Categories",
  "/app/credentials": "Keys & Credentials",
  "/app/blockages": "Blockages",
};

export const RouteGuard = ({ children }) => {
  const { tabs } = useTabs();
  const location = useLocation();
  
  // If tabs not loaded yet, show children (loading state)
  if (!tabs) return children;
  
  const isSuperAdmin = tabs?.isSuperAdmin ?? false;
  const currentPath = location.pathname;
  
  // Always allow settings and profile
  if (currentPath === "/app/settings" || currentPath === "/app/profile") {
    return children;
  }
  
  // Find required module for current path
  const requiredModule = Object.entries(routeModuleMap).find(([route]) => 
    currentPath.startsWith(route)
  )?.[1];
  
  // If no module mapping found, allow access
  if (!requiredModule) return children;
  
  // Check permission
  const hasAccess = isSuperAdmin || 
    tabs?.modulePermissions?.some(perm => 
      perm.module === requiredModule && Array.isArray(perm.actions) && perm.actions.length > 0
    );
  
  return hasAccess ? children : <Navigate to="/app/dashboard" replace />;
};