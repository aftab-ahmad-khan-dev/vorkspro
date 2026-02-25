import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Confirmation from "@/models/Confirmation";
import Attendee from "@/pages/private/Attendee";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Topbar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    const checkTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkTheme();
    const mo = new MutationObserver(checkTheme);
    mo.observe(document.documentElement, { attributes: true });
    return () => mo.disconnect();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setIsDark(root.classList.contains("dark"));
  };

  const format = (text) =>
    text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const path = location.pathname;
  const segments = path.split("/").filter(Boolean); // e.g. ["projects", "project", "details"]
  const isDashboard = path === "/" || path === "/dashboard";

  // LABEL MAP (entity names)
  const lable = {
    projects: "Projects",
    milestones: "Milestones",
    employees: "Employees",
    clients: "Client Management",
    mytodolist: "My To-Do List",
  };

  const lableKey = segments[0] || "";
  const label = lable[lableKey];
  const lablePath = `/${lableKey}`;

  // MODULE MAP (module titles)
  const moduleMap = {
    projects: "Project Management",
    milestones: "Project Management",

    attendance: "Employees Management",
    employees: "Employees Management",
    performance: "Employees Management",
    payroll: "Employees Management",
  };

  const moduleKey = segments[0] || "";
  const moduleLabel = moduleMap[moduleKey];
  const modulePath = `/${moduleKey}`;

  // ----- ACTIVE LABEL LOGIC -----
  const lastSegment = segments[segments.length - 1] || "";
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(lastSegment);

  let activeLabel = "";

  // 1) HARD DETAIL ROUTES (string based, so it works for any depth)
  if (path.includes("/projects") && path.includes("/details")) {
    activeLabel = "Project Details";
  } else if (path.includes("/employees") && path.includes("/details")) {
    activeLabel = "Employee Details";
  } else if (path.includes("/clients") && path.includes("/details")) {
    activeLabel = "Client Details";
  }
  // 2) OBJECT ID DETAIL PAGES  (e.g. /projects/:id)
  else if (isMongoId) {
    const detailsLabelMap = {
      projects: "Project Details",
      milestones: "Milestone Details",
      employees: "Employee Details",
      clients: "Client Details",
    };
    activeLabel = detailsLabelMap[moduleKey] || "Details";
  }
  // 3) DEFAULT – just last segment pretty formatted
  else if (lastSegment) {
    activeLabel = format(lastSegment);
  }

  // Are we on a "Details" page?
  const isDetailPage = !!label && activeLabel.endsWith("Details");

  const NavButton = ({ icon: Icon, to, label }) => {
    const isActive = location.pathname.startsWith(to);

    return (
      <button
        aria-label={label}
        onClick={() => navigate(to)}
        className={cn(
          "relative flex h-[42px] w-[42px] items-center justify-center rounded-xl",
          "transition-all duration-300",
          "backdrop-blur-md select-none",
          "hover:scale-[1.06] active:scale-[0.97]",
          "hover:bg-slate-200/70 dark:hover:bg-slate-800/60",
          "shadow-sm hover:shadow-md dark:shadow-none",
          isActive &&
            "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-blue-500/20",
        )}
      >
        {isActive && (
          <div className="absolute inset-0 -z-10 blur-xl bg-blue-500/30 dark:bg-blue-400/20" />
        )}

        <Icon className="h-[20px] w-[20px] transition-all duration-300" />

        {isActive && (
          <span className="absolute -bottom-[6px] h-[3px] w-7 rounded-full bg-blue-500 dark:bg-blue-400 shadow-sm" />
        )}
      </button>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-10",
        "backdrop-blur-3xl",
        "bg-white/60 dark:bg-slate-950/30",
        "border-b border-slate-200/50 dark:border-slate-800/50",
        "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.12)] dark:shadow-none",
        "supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-slate-950/20",
      )}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent dark:via-slate-700/40 pointer-events-none" />

      <nav className="flex h-16 items-center justify-between  px-4 lg:px-6">
        <div className="flex justify-between w-full items-center gap-4">
          <div className="flex gap-5 items-center">
            {toggleSidebar && (
              <>
                {/* Desktop button (visible when sidebar is open) */}
                <button
                  aria-label="Toggle sidebar"
                  onClick={toggleSidebar}
                  className={cn(
                    "flex h-[42px] w-[42px] text-[var(--foreground)] cursor-pointer items-center justify-center rounded-xl",
                    "bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/60",
                    "transition-all duration-300 hover:scale-[1.05] active:scale-95",
                    `${isSidebarOpen ? "visible" : "hidden"}`,
                  )}
                >
                  {isSidebarOpen ? <Menu className="h-5 w-5" /> : null}
                </button>

                {/* Mobile button (visible when sidebar is hidden) */}
                <button
                  aria-label="Toggle sidebar"
                  onClick={toggleSidebar}
                  className={cn(
                    "flex h-[42px] w-[42px] text-[var(--foreground)] cursor-pointer items-center justify-center rounded-xl",
                    "bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/60",
                    "transition-all md:hidden duration-300 hover:scale-[1.05] active:scale-95",
                  )}
                >
                  {!isSidebarOpen ? <Menu className="h-5 w-5" /> : null}
                </button>
              </>
            )}

            <div className="flex flex-col leading-tight select-none">
              <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                Vorks Pro Admin
              </span>
              <nav className="text-xs hidden sm:flex text-slate-500 dark:text-slate-400">
                <ol className="flex items-center space-x-1">
                  {/* Dashboard */}
                  <li>
                    <button
                      className="hover:text-slate-700 cursor-pointer dark:hover:text-slate-300"
                      onClick={() => navigate("/app/dashboard")}
                    >
                      Dashboard
                    </button>
                  </li>

                  {/* Stop breadcrumb on dashboard */}
                  {isDashboard ? null : (
                    <>
                      {/* MODULE LEVEL */}
                      {moduleLabel && (
                        <>
                          <li>/</li>
                          <li>
                            <button
                              className="hover:text-slate-700 cursor-pointer dark:hover:text-slate-300"
                              onClick={() => {
                                if (moduleLabel === "Employees Management") {
                                  navigate("/app/employees");
                                } else if (
                                  moduleLabel === "Project Management"
                                ) {
                                  navigate("/app/projects");
                                } else {
                                  navigate(modulePath);
                                }
                              }}
                            >
                              {moduleLabel}
                            </button>
                          </li>
                        </>
                      )}

                      {/* LIST vs DETAILS LOGIC */}

                      {/* LIST or simple page:
                        Dashboard / Module / ActiveLabel
                     */}
                      {!isDetailPage && activeLabel && (
                        <>
                          <li>/</li>
                          <li className="text-slate-700 dark:text-slate-200 font-semibold">
                            {activeLabel}
                          </li>
                        </>
                      )}

                      {/* DETAIL PAGE:
                        Dashboard / Module / Label (list) / Details
                     */}
                      {isDetailPage && (
                        <>
                          {label && (
                            <>
                              <li>/</li>
                              <li>
                                <button
                                  className="hover:text-slate-700 cursor-pointer dark:hover:text-slate-300"
                                  onClick={() => navigate(lablePath)}
                                >
                                  {label}
                                </button>
                              </li>
                            </>
                          )}

                          <li>/</li>
                          <li className="text-slate-700 dark:text-slate-200 font-semibold">
                            {activeLabel}
                          </li>
                        </>
                      )}
                    </>
                  )}
                </ol>
              </nav>
            </div>
          </div>
          <div>
            <Select
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value);

                if (value === "admin-dashboard") {
                  navigate("/app/admin-dashboard");
                }

                if (value === "hr-dashboard") {
                  navigate("/app/hr-dashboard");
                }

                if (value === "project-manager-dashboard") {
                  navigate("/app/project-manager-dashboard");
                }

                if (value === "finance-manager-dashboard") {
                  navigate("/app/finance-manager-dashboard");
                }

                if (value === "employee-dashboard") {
                  navigate("/app/employee-dashboard");
                }

              }}
            >
              <SelectTrigger className="w-full text-foreground border rounded-lg px-3 py-2 text-sm">
                <SelectValue  placeholder="Switch Role" /> 
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="admin-dashboard">Admin Dashboard</SelectItem>

                <SelectItem value="hr-dashboard">HR Dashboard</SelectItem>

                <SelectItem value="project-manager-dashboard">
                  Project Manager Dashboard
                </SelectItem>

                <SelectItem value="finance-manager-dashboard">
                  Finance Manager Dashboard
                </SelectItem>

                <SelectItem value="employee-dashboard">
                  Employee Dashboard
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </nav>
    </header>
  );
}
