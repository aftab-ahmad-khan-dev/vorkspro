import { Navigate, useLocation } from "react-router-dom";
import { useTabs } from "@/context/TabsContext";

const routeModuleMap = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/timesheets": "Attendance",
  "/performance": "Performance",
  "/payroll": "Payroll",
  "/projects": "Projects",
  "/milestones": "Milestones",
  "/client-management": "Client Management",
  "/clients": "Client Management",
  "/finance": "Finance",
  "/hr-management": "HR Management",
  "/reports": "Reports & Analytics",
  "/follow-up-hub": "Follow-up-Hub",
  "/my-todo-list": "My To-Do Hub",
  "/admin-&-assets": "Admin & Assets",
  "/knowledge-base": "Knowledge Base",
  "/announcements": "Announcements",
  "/categories": "Categories",
  "/credentials": "Keys & Credentials",
  "/blockages": "Blockages",
};

export const RouteGuard = ({ children }) => {
  const { tabs } = useTabs();
  const location = useLocation();
  
  // If tabs not loaded yet, show children (loading state)
  if (!tabs) return children;
  
  const isSuperAdmin = tabs?.isSuperAdmin ?? false;
  const currentPath = location.pathname;
  
  // Always allow settings and profile
  if (currentPath === "/settings" || currentPath === "/profile") {
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
  
  return hasAccess ? children : <Navigate to="/dashboard" replace />;
};