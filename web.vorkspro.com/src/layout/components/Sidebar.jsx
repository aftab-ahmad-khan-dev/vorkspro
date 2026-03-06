// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  DollarSign,
  UserCheck,
  BarChart3,
  BookOpen,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Calendar,
  Star,
  SquareCheckBig,
  ChevronLeft,
  Package,
  MessageSquare,
  LayoutDashboard,
  Users,
  Flag,
  ClipboardList,
  Construction,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/vorkspro-logo.svg";
import { useTabs } from "@/context/TabsContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function Sidebar({ isSidebarOpen, toggleSidebar, isMobile }) {
  const [openMenus, setOpenMenus] = useState(["employee", "project"]);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { tabs, setTabs, setActions } = useTabs(); // This may be null/undefined while loading

  const isLoading = !tabs; // Skeleton shown when tabs are not yet available

  // === PERMISSION LOGIC (only runs when tabs are loaded) ===
  const userRole = tabs;
  const isSuperAdmin = tabs?.isSuperAdmin ?? false;

  const allowedModuleNames = isSuperAdmin
    ? [
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
    ]
    : (userRole?.modulePermissions || []).map((perm) => perm.module);

  const hasPermission = (moduleName) => {
    return isSuperAdmin || allowedModuleNames.includes(moduleName);
  };

  const hasAnyChildPermission = (children) => {
    return children.some((child) => hasPermission(child));
  };

  // Theme detection
  useEffect(() => {
    const checkTheme = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) =>
      prev.includes(menuKey)
        ? prev.filter((m) => m !== menuKey)
        : [...prev, menuKey]
    );
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="h-full flex flex-col bg-[var(--background)] border-r border-[var(--border)]"
    >
      {/* Header: Logo + Toggle */}
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.25 }}
        className="flex items-center justify-between gap-2 px-4 py-4 border-b border-[var(--border)] flex-shrink-0"
      >
        {isSidebarOpen ? (
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isLoading ? (
              <div className="h-9 w-36 rounded-lg bg-[var(--muted)]/60 animate-pulse" />
            ) : (
              <>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/20">
                  <img
                    src={logo}
                    alt=""
                    className="h-5 w-5 object-contain dark:invert dark:opacity-90"
                  />
                </div>
                <span className="font-semibold tracking-tight text-[var(--foreground)] truncate text-[15px]">
                  Vorks Pro
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 min-w-0" />
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleSidebar}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                "hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)]",
                "active:scale-[0.97]"
              )}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {isSidebarOpen ? "Collapse" : "Expand"}
          </TooltipContent>
        </Tooltip>
      </motion.header>

      {/* Scrollable Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
      >
        {isLoading ? (
          <SidebarSkeleton isSidebarOpen={isSidebarOpen} />
        ) : (
          <div className="space-y-6">
            {/* Main */}
            <NavSection label={isSidebarOpen ? "Main" : null}>
              {hasPermission("Dashboard") && (
                <NavItem
                  id="driver-sidebar-dashboard"
                  icon={<LayoutDashboard size={16} />}
                  label="Dashboard"
                  link="/app/dashboard"
                  active={location.pathname === "/app/dashboard"}
                  isSidebarOpen={isSidebarOpen}
                />
              )}
            </NavSection>

            {/* Management */}
            <NavSection label={isSidebarOpen ? "Management" : null}>
            {/* Employee Management Group */}
            {hasAnyChildPermission(["Employees", "Attendance", "Performance", "Payroll"]) && (
              <NavGroup
                icon={<Users size={16} />}
                label="Employee Management"
                menuKey="employee"
                open={openMenus.includes("employee")}
                onToggle={() => toggleMenu("employee")}
                isActive={location.pathname.startsWith("/app/employee") ||
                  ["employees", "attendance", "performance", "payroll"].some(p => location.pathname.startsWith(`/app/${p}`))}
                items={[
                  hasPermission("Employees") && {
                    label: "Employees",
                    link: "/app/employees",
                    icon: <Users size={16} />,
                    driverId: "driver-sidebar-employees",
                  },
                  hasPermission("Attendance") && {
                    label: "Attendance",
                    link: "/app/attendance",
                    icon: <Calendar size={16} />,
                    driverId: "driver-sidebar-attendance",
                  },
                  hasPermission("Performance") && {
                    label: "Performance",
                    link: "/app/performance",
                    icon: <Star size={16} />,
                    driverId: "driver-sidebar-performance",
                  },
                  hasPermission("Payroll") && {
                    label: "Payroll",
                    link: "/app/payroll",
                    icon: <DollarSign size={16} />,
                    driverId: "driver-sidebar-payroll",
                  },
                ].filter(Boolean)}
                isSidebarOpen={isSidebarOpen}
                location={location}
              />
            )}

            {/* Project Management Group */}
            {hasAnyChildPermission(["Projects", "Milestones"]) && (
              <NavGroup
                icon={<Briefcase size={16} />}
                label="Project Management"
                menuKey="project"
                open={openMenus.includes("project")}
                onToggle={() => toggleMenu("project")}
                isActive={location.pathname.startsWith("/app/project") ||
                  ["projects", "milestones"].some(p => location.pathname.startsWith(`/app/${p}`))}
                items={[
                  hasPermission("Projects") && {
                    label: "Projects",
                    link: "/app/projects",
                    icon: <Briefcase size={16} />,
                    driverId: "driver-sidebar-projects",
                  },
                  hasPermission("Keys & Credentials") && {
                    label: "Keys & Credentials",
                    link: "/app/projects/credentials",
                    icon: <Key size={16} />,
                    driverId: "driver-sidebar-credentials",
                  },
                  hasPermission("Milestones") && {
                    label: "Milestones",
                    link: "/app/milestones",
                    icon: <Flag size={16} />,
                    driverId: "driver-sidebar-milestones",
                  },
                  hasPermission("Blockages") && {
                    label: "Blockages",
                    link: "/app/blockages",
                    icon: <Construction size={16} />,
                    driverId: "driver-sidebar-blockages",
                  },
                ].filter(Boolean)}
                isSidebarOpen={isSidebarOpen}
                location={location}
              />
            )}

            {/* Standalone Modules */}
            {hasPermission("Client Management") && (
              <NavItem id="driver-sidebar-client-management" icon={<Briefcase size={16} />} label="Client Management" link="/app/client-management" active={location.pathname.startsWith("/app/client-management")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Follow-up-Hub") && (
              <NavItem id="driver-sidebar-follow-up" icon={<MessageSquare size={16} />} label="Follow-up Hub" link="/app/follow-up-hub" active={location.pathname.startsWith("/app/follow-up-hub")} isSidebarOpen={isSidebarOpen} />
            )}
            {/* Chat is available to all authenticated users */}
            <NavItem
              id="driver-sidebar-chat"
              icon={<MessageSquare size={16} />}
              label="Chat"
              link="/app/chat"
              active={location.pathname.startsWith("/app/chat")}
              isSidebarOpen={isSidebarOpen}
            />
            {hasPermission("Finance") && (
              <NavItem id="driver-sidebar-finance" icon={<DollarSign size={16} />} label="Finance" link="/app/finance" active={location.pathname.startsWith("/app/finance")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("HR Management") && (
              <NavItem id="driver-sidebar-hr-management" icon={<UserCheck size={16} />} label="HR Management" link="/app/hr-management" active={location.pathname.startsWith("/app/hr-management")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("My To-Do Hub") && (
              <NavItem id="driver-sidebar-my-todo" icon={<SquareCheckBig size={16} />} label="My To-Do Hub" link="/app/my-todo-list" active={location.pathname.startsWith("/app/my-todo-list")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Reports & Analytics") && (
              <NavItem id="driver-sidebar-reports" icon={<BarChart3 size={16} />} label="Reports & Analytics" link="/app/reports" active={location.pathname.startsWith("/app/reports")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Admin & Assets") && (
              <NavItem id="driver-sidebar-admin-assets" icon={<Package size={16} />} label="Admin & Assets" link="/app/admin-&-assets" active={location.pathname.startsWith("/app/admin-&-assets")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Knowledge Base") && (
              <NavItem id="driver-sidebar-knowledge" icon={<BookOpen size={16} />} label="Knowledge Base" link="/app/knowledge-base" active={location.pathname.startsWith("/app/knowledge-base")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Announcements") && (
              <NavItem id="driver-sidebar-announcements" icon={<Bell size={16} />} label="Announcements" link="/app/announcements" active={location.pathname.startsWith("/app/announcements")} isSidebarOpen={isSidebarOpen} />
            )}
            </NavSection>
          </div>
        )}
      </motion.nav>

      {/* Footer: Account */}
      <motion.footer
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.25 }}
        className="border-t border-[var(--sidebar-border)] px-3 py-3 flex-shrink-0 bg-[var(--sidebar-accent)]/30 dark:bg-[var(--sidebar)]"
      >
        <NavSection label={isSidebarOpen ? "Account" : null} compact>
        {isLoading ? (
          <>
            <SkeletonItem isSidebarOpen={isSidebarOpen} />
            <SkeletonItem isSidebarOpen={isSidebarOpen} />
            <SkeletonItem isSidebarOpen={isSidebarOpen} />
            <SkeletonItem isSidebarOpen={isSidebarOpen} className="bg-red-100 dark:bg-red-900/20" />
          </>
        ) : (
          <>
            {hasPermission("Categories") && (
              <NavItem
                id="driver-sidebar-categories"
                icon={<ClipboardList size={16} />}
                label="Categories"
                link="/app/categories"
                active={location.pathname.startsWith("/app/categories")}
                isSidebarOpen={isSidebarOpen}
              />
            )}

            <NavItem
              id="driver-sidebar-settings"
              icon={<Settings size={16} />}
              label="Settings"
              link="/app/settings"
              active={location.pathname.startsWith("/app/settings")}
              isSidebarOpen={isSidebarOpen}
            />

            <NavItem
              id="driver-sidebar-profile"
              icon={<User size={16} />}
              label="Profile"
              link="/app/profile"
              active={location.pathname.startsWith("/app/profile")}
              isSidebarOpen={isSidebarOpen}
            />

            <NavItem
              id="driver-sidebar-logout"
              onClick={() => {
                setTabs(null);
                setActions([]);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                navigate("/login", { replace: true });
              }}
              icon={<LogOut size={16} />}
              label="Logout"
              className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10 dark:hover:bg-[var(--destructive)]/15"
              isSidebarOpen={isSidebarOpen}
            />
          </>
        )}
        </NavSection>
      </motion.footer>
    </motion.div>
  );
}

/* NavSection - optional section label */
function NavSection({ label, children, compact = false }) {
  return (
    <div className={cn("space-y-1", compact && "space-y-0.5")}>
      {label && (
        <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

/* Skeleton Components */
function SidebarSkeleton({ isSidebarOpen }) {
  return (
    <div className="space-y-1">
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
      <div className="space-y-1">
        <SkeletonItem isSidebarOpen={isSidebarOpen} indent />
        {isSidebarOpen && (
          <>
            <SkeletonItem isSidebarOpen={isSidebarOpen} indent deep />
            <SkeletonItem isSidebarOpen={isSidebarOpen} indent deep />
            <SkeletonItem isSidebarOpen={isSidebarOpen} indent deep />
          </>
        )}
      </div>
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
      <div className="space-y-1">
        <SkeletonItem isSidebarOpen={isSidebarOpen} indent />
        {isSidebarOpen && <SkeletonItem isSidebarOpen={isSidebarOpen} indent deep />}
      </div>
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
      <SkeletonItem isSidebarOpen={isSidebarOpen} />
    </div>
  );
}

function SkeletonItem({ isSidebarOpen, indent = false, deep = false, className = "" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md transition-all",
        isSidebarOpen ? "px-4 py-2" : "px-2 py-2 justify-center",
        indent && isSidebarOpen && "ml-9",
        indent && !isSidebarOpen && "ml-2",
        deep && "px-3 py-1.5"
      )}
    >
      <div className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
      {isSidebarOpen && (
        <div className={cn("h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse flex-1", className)} />
      )}
    </div>
  );
}

/* Reusable NavItem */
function NavItem({
  id,
  icon,
  label,
  link,
  active = false,
  onClick,
  className = "",
  isSidebarOpen,
}) {
  const content = (
    <div
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg transition-all duration-200",
        "px-3 py-2.5",
        "hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)]",
        active && "bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 text-[var(--foreground)] font-medium",
        active && "ring-1 ring-[var(--primary)]/20",
        className,
        !isSidebarOpen && "justify-center px-2"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-[var(--primary)]" />
      )}
      <span className={cn("flex-shrink-0 text-[var(--muted-foreground)] [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-inherit", active && "text-[var(--primary)]")}>
        {icon}
      </span>
      {isSidebarOpen && (
        <span className="text-sm truncate text-[var(--foreground)]">
          {label}
        </span>
      )}
    </div>
  );

  const wrapped = onClick ? (
    <button type="button" onClick={onClick} className="w-full text-left" {...(id && { id })}>
      {content}
    </button>
  ) : (
    <Link to={link} {...(id && { id })} className="w-full block">
      {content}
    </Link>
  );

  if (!isSidebarOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }
  return wrapped;
}

/* Reusable NavGroup */
function NavGroup({
  icon,
  label,
  menuKey,
  open,
  onToggle,
  items,
  isActive = false,
  isSidebarOpen,
  location,
}) {
  if (items.length === 0) return null;

  const hasActiveChild = items.some(
    (item) => location.pathname === item.link || location.pathname.startsWith(item.link + "/")
  );
  const isGroupActive = isActive || hasActiveChild;

  const trigger = (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 text-left",
        "hover:bg-[var(--sidebar-accent)] dark:hover:bg-[var(--sidebar-accent)]",
        isGroupActive && "bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 font-medium",
        isGroupActive && "ring-1 ring-[var(--primary)]/20",
        !isSidebarOpen && "justify-center px-2"
      )}
      aria-expanded={open}
    >
      {isGroupActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-[var(--primary)]" />
      )}
      <span className={cn("flex-shrink-0 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-inherit", isGroupActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>
        {icon}
      </span>
      {isSidebarOpen && (
        <>
          <span className="flex-1 text-sm truncate text-[var(--foreground)]">{label}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 text-[var(--muted-foreground)]"
          >
            <ChevronDown size={16} />
          </motion.span>
        </>
      )}
    </button>
  );

  return (
    <div className="relative">
      {!isSidebarOpen ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label} {open ? "−" : "+"}
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className={cn("overflow-hidden", isSidebarOpen ? "ml-4 mt-0.5 border-l border-[var(--sidebar-border)] pl-2" : "ml-2 mt-1")}
          >
            {items.map((item) => {
              const matches = (it) =>
                location.pathname === it.link || location.pathname.startsWith(it.link + "/");
              const activeItem = items.filter(matches).sort((a, b) => b.link.length - a.link.length)[0];
              const isChildActive = activeItem && item.link === activeItem.link;

              const childLink = (
                <Link
                  to={item.link}
                  {...(item.driverId && { id: item.driverId })}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
                    isSidebarOpen ? "py-2" : "px-2 justify-center",
                    isChildActive
                      ? "bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 font-medium text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"
                  )}
                >
                  <span className="flex-shrink-0 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-inherit">{item.icon}</span>
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              );

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {!isSidebarOpen ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{childLink}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={10}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    childLink
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Sidebar;