import React, { useState } from "react";
import { Menu, Shield, Compass } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTour } from "@/context/TourContext";
import { cn } from "@/lib/utils";
import Confirmation from "@/models/Confirmation";
import Attendee from "@/pages/private/Attendee";
import { useTabs } from "@/context/TabsContext";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Topbar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerTour } = useTour();
  const { tabs } = useTabs();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const roleName = tabs?.name?.trim() || "Admin";

  const format = (text) =>
    text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const path = location.pathname;
  const segments = path.split("/").filter(Boolean); // e.g. ["projects", "project", "details"]
  const isDashboard =
    path === "/" || path === "/dashboard" || path === "/app/dashboard";

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
          "hover:bg-[var(--accent)]",
          "shadow-sm hover:shadow-md",
          isActive &&
            "bg-[var(--button)] text-[var(--primary-foreground)] shadow-lg",
        )}
      >
        {isActive && (
          <div className='absolute inset-0 -z-10 blur-xl bg-blue-500/30 dark:bg-blue-400/20' />
        )}

        <Icon className='h-[20px] w-[20px] transition-all duration-300' />

        {isActive && (
          <span className='absolute -bottom-[6px] h-[3px] w-7 rounded-full bg-blue-500 dark:bg-blue-400 shadow-sm' />
        )}
      </button>
    );
  };

  return (
    <header
      id="driver-page-header"
      className={cn(
        "sticky top-0 z-10",
        "backdrop-blur-3xl",
        "bg-[var(--background)]/95 supports-[backdrop-filter]:bg-[var(--background)]/80",
        "border-b border-[var(--border)]",
        "shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08)]",
      )}
    >

      <nav className='flex h-16 items-center justify-between  px-4 lg:px-6'>
        <div className='flex justify-between w-full items-center gap-4'>
          <div className='flex gap-5 items-center'>
            {toggleSidebar && (
              <>
                {/* Desktop button (visible when sidebar is open) */}
                <button
                  aria-label='Toggle sidebar'
                  onClick={toggleSidebar}
                  className={cn(
                    "flex h-[42px] w-[42px] text-[var(--foreground)] cursor-pointer items-center justify-center rounded-xl",
                    "bg-[var(--muted)]/80 hover:bg-[var(--accent)]",
                    "transition-all duration-300 hover:scale-[1.05] active:scale-95",
                    `${isSidebarOpen ? "visible" : "hidden"}`,
                  )}
                >
                  {isSidebarOpen ? <Menu className='h-5 w-5' /> : null}
                </button>

                {/* Mobile button (visible when sidebar is hidden) */}
                <button
                  aria-label='Toggle sidebar'
                  onClick={toggleSidebar}
                  className={cn(
                    "flex h-[42px] w-[42px] text-[var(--foreground)] cursor-pointer items-center justify-center rounded-xl",
                    "bg-[var(--muted)]/80 hover:bg-[var(--accent)]",
                    "transition-all md:hidden duration-300 hover:scale-[1.05] active:scale-95",
                  )}
                >
                  {!isSidebarOpen ? <Menu className='h-5 w-5' /> : null}
                </button>
              </>
            )}

            <div className='flex flex-col leading-tight select-none'>
              <span className='text-[15px] font-bold tracking-tight text-[var(--foreground)]'>
                Vorks Pro {roleName}
              </span>
              <nav className='text-xs hidden sm:flex text-[var(--muted-foreground)]'>
                <ol className='flex items-center space-x-1'>
                  {/* Dashboard */}
                  <li>
                    <button
                      className='hover:text-[var(--foreground)] cursor-pointer'
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
                              className='hover:text-[var(--foreground)] cursor-pointer'
                              onClick={() => {
                                if (moduleLabel === "Employees Management") {
                                  navigate("/app/employees");
                                } else if (moduleLabel === "Project Management") {
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
                          <li className='text-[var(--foreground)] font-semibold'>
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
                                  className='hover:text-[var(--foreground)] cursor-pointer'
                                  onClick={() => navigate(lablePath)}
                                >
                                  {label}
                                </button>
                              </li>
                            </>
                          )}

                          <li>/</li>
                          <li className='text-[var(--foreground)] font-semibold'>
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
          <div className='flex items-center gap-2'>
            <NotificationsDropdown />
            <button
              type="button"
              onClick={() => triggerTour(location.pathname)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-colors border border-transparent hover:border-[var(--border)]"
              title="Guide Ride – Dashboard walkthrough"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Guide Ride</span>
            </button>
            <span className='text-sm inline-flex justify-center items-center text-muted-foreground border rounded-lg px-2 py-1 min-w-[80px] text-center'>
              <Shield className='h-4 w-4 mr-1.5 text-yellow-500' /> {roleName}
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
