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
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full flex flex-col bg-[var(--background)]"
    >
      {/* Header: Logo + Toggle */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center justify-between px-4 py-[11px] md:py-[14px] border-b border-gray-200 dark:border-[var(--border)] flex-shrink-0"
      >
        {isSidebarOpen && (
          <div className="flex items-center gap-2 min-w-0">
            {isLoading ? (
              <div className="h-9 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <>
                <img
                  src={logo}
                  alt="Vorks Pro"
                  className="h-8 w-auto md:h-9 flex-shrink-0 object-contain dark:invert dark:opacity-90"
                />
                <span className="text-base font-bold tracking-tight text-[var(--primary)] dark:text-[var(--primary)] truncate">
                  Vorks Pro
                </span>
              </>
            )}
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-10 w-10  items-center justify-center rounded-xl transition-all",
            "bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/60",
            "hover:scale-105 active:scale-95 md:hidden"
          )}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
        </button>

        {!isSidebarOpen && !isMobile && (
          <button
            onClick={toggleSidebar}
            className="ml-1 flex h-9 w-10 text-foreground items-center justify-center rounded-md hover:bg-[var(--button)]/20 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        )}
      </motion.div>

      {/* Scrollable Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 overflow-y-auto px-2 py-4 text-sm space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700"
      >
        {isLoading ? (
          <SidebarSkeleton isSidebarOpen={isSidebarOpen} />
        ) : (
          <>
            {/* Dashboard */}
            {hasPermission("Dashboard") && (
              <NavItem
                icon={<LayoutDashboard size={16} />}
                label="Dashboard"
                link="/app/dashboard"
                active={location.pathname === "/app/dashboard"}
                isSidebarOpen={isSidebarOpen}
              />
            )}

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
                  },
                  hasPermission("Attendance") && {
                    label: "Attendance",
                    link: "/app/attendance",
                    icon: <Calendar size={16} />,
                  },
                  hasPermission("Performance") && {
                    label: "Performance",
                    link: "/app/performance",
                    icon: <Star size={16} />,
                  },
                  hasPermission("Payroll") && {
                    label: "Payroll",
                    link: "/app/payroll",
                    icon: <DollarSign size={16} />,
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
                  },
                  hasPermission("Keys & Credentials") && {
                    label: "Keys & Credentials",
                    link: "/app/projects/credentials",
                    icon: <Key size={16} />,
                  },
                  hasPermission("Milestones") && {
                    label: "Milestones",
                    link: "/app/milestones",
                    icon: <Flag size={16} />,
                  },
                  hasPermission("Blockages") && {
                    label: "Blockages",
                    link: "/app/blockages",
                    icon: <Construction size={16} />,
                  },
                ].filter(Boolean)}
                isSidebarOpen={isSidebarOpen}
                location={location}
              />
            )}

            {/* Standalone Modules */}
            {hasPermission("Client Management") && (
              <NavItem icon={<Briefcase size={16} />} label="Client Management" link="/app/client-management" active={location.pathname.startsWith("/app/client-management")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Follow-up-Hub") && (
              <NavItem icon={<MessageSquare size={16} />} label="Follow-up Hub" link="/app/follow-up-hub" active={location.pathname.startsWith("/app/follow-up-hub")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Finance") && (
              <NavItem icon={<DollarSign size={16} />} label="Finance" link="/app/finance" active={location.pathname.startsWith("/app/finance")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("HR Management") && (
              <NavItem icon={<UserCheck size={16} />} label="HR Management" link="/app/hr-management" active={location.pathname.startsWith("/app/hr-management")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("My To-Do Hub") && (
              <NavItem icon={<SquareCheckBig size={16} />} label="My To-Do Hub" link="/app/my-todo-list" active={location.pathname.startsWith("/app/my-todo-list")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Reports & Analytics") && (
              <NavItem icon={<BarChart3 size={16} />} label="Reports & Analytics" link="/app/reports" active={location.pathname.startsWith("/app/reports")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Admin & Assets") && (
              <NavItem icon={<Package size={16} />} label="Admin & Assets" link="/app/admin-&-assets" active={location.pathname.startsWith("/app/admin-&-assets")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Knowledge Base") && (
              <NavItem icon={<BookOpen size={16} />} label="Knowledge Base" link="/app/knowledge-base" active={location.pathname.startsWith("/app/knowledge-base")} isSidebarOpen={isSidebarOpen} />
            )}
            {hasPermission("Announcements") && (
              <NavItem icon={<Bell size={16} />} label="Announcements" link="/app/announcements" active={location.pathname.startsWith("/app/announcements")} isSidebarOpen={isSidebarOpen} />
            )}
          </>
        )}
      </motion.nav>

      {/* Footer: Settings, Categories, Profile, Logout */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="border-t border-gray-200 dark:border-slate-800 px-3 py-3 space-y-2 flex-shrink-0 bg-white dark:bg-slate-950/30"
      >
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
                icon={<ClipboardList size={16} />}
                label="Categories"
                link="/app/categories"
                active={location.pathname.startsWith("/app/categories")}
                isSidebarOpen={isSidebarOpen}
              />
            )}

            <NavItem
              icon={<Settings size={16} />}
              label="Settings"
              link="/app/settings"
              active={location.pathname.startsWith("/app/settings")}
              isSidebarOpen={isSidebarOpen}
            />

            <NavItem
              icon={<User size={16} />}
              label="Profile"
              link="/app/profile"
              active={location.pathname.startsWith("/app/profile")}
              isSidebarOpen={isSidebarOpen}
            />

            <NavItem
              onClick={() => {
                setTabs(null);
                setActions([]);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                navigate("/login", { replace: true });
              }}
              icon={<LogOut size={16} />}
              label="Logout"
              className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              isSidebarOpen={isSidebarOpen}
            />
          </>
        )}
      </motion.div>
    </motion.div>
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
  icon,
  label,
  link,
  active = false,
  onClick,
  className = "",
  isSidebarOpen,
}) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "my-1 flex w-full items-center gap-3 px-4 py-2 rounded-md transition-all duration-200",
        "hover:bg-[var(--button)]/20",
        active && "bg-[var(--button)]/30 text-[var(--foreground)] font-medium",
        className,
        !isSidebarOpen && "justify-center px-2"
      )}
    >
      <motion.span
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        className="text-foreground"
      >
        {icon}
      </motion.span>
      {isSidebarOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="text-sm truncate text-foreground"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );

  if (onClick) {
    return <button onClick={onClick}>{content}</button>;
  }

  return <Link to={link}>{content}</Link>;
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

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between px-4 py-2 rounded-md transition-all duration-200",
          "hover:bg-[var(--button)]/20",
          (isActive || hasActiveChild) && "bg-[var(--button)]/20 text-[var(--foreground)] font-medium",
          !isSidebarOpen && "justify-center px-2"
        )}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <motion.span
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-foreground"
          >
            {icon}
          </motion.span>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-foreground"
            >
              {label}
            </motion.span>
          )}
        </div>
        {isSidebarOpen && (
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronDown className="text-foreground" size={16} />
          </motion.div>
        )}
      </motion.button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn("mt-1 space-y-1 overflow-hidden", isSidebarOpen ? "ml-9" : "ml-2")}
              >
                {items.map((item) => {
                  const matches = (it) =>
                    location.pathname === it.link || location.pathname.startsWith(it.link + "/");
                  const activeItem = items.filter(matches).sort((a, b) => b.link.length - a.link.length)[0];
                  const isChildActive = activeItem && item.link === activeItem.link;

                  return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: items.indexOf(item) * 0.05 }}
                >
                  <Link
                    to={item.link}
                    className={cn(
                      "flex items-center rounded-md text-sm transition-all duration-200",
                      isSidebarOpen ? "px-3 py-1.5" : "px-2 py-2 justify-center",
                      isChildActive
                        ? "bg-[var(--button)]/30 text-[var(--foreground)] font-medium"
                        : "hover:bg-[var(--button)]/20"
                    )}
                  >
                    <motion.span
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.2 }}
                      className="text-foreground"
                    >
                      {item.icon}
                    </motion.span>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 truncate text-foreground"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </Link>
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