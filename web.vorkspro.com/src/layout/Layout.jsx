import React, { useState, useEffect, useCallback, memo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { apiGet } from "@/interceptor/interceptor";
import { THEMES_LIGHT, THEMES_DARK } from "@/constants/themes";
import { applyThemePreference, getThemePreference } from "@/lib/theme";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { jwtDecode } from "jwt-decode";
import { useTabs } from "@/context/TabsContext";

// ====================
// Memoized Sidebar
// ====================
const SidebarMemo = memo(Sidebar);

function Layout() {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;

  const { setTabs, setActions } = useTabs();
  const location = useLocation();

  // ===== Responsive Sidebar State =====
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // =========================
  // Apply Theme: use themePreference (light | dark | neon-purple); server preference applied after get-roles
  // =========================
  useEffect(() => {
    applyThemePreference(getThemePreference());
    const storageHandler = () => applyThemePreference(getThemePreference());
    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
  }, []);

  // When not neon-purple, apply accent color from existing localStorage keys
  useEffect(() => {
    const pref = getThemePreference();
    if (pref === "neon-purple") return;
    const savedTheme = localStorage.getItem("themeMode") || "light";
    const savedLightColor = localStorage.getItem("lightColor") || "vorkspro";
    const savedDarkColor = localStorage.getItem("darkColor") || "vorkspro";
    const activeColor =
      savedTheme === "dark"
        ? (THEMES_DARK[savedDarkColor] ?? THEMES_DARK.vorkspro)
        : (THEMES_LIGHT[savedLightColor] ?? THEMES_LIGHT.vorkspro);
    document.documentElement.style.setProperty("--primary", activeColor);
    document.documentElement.style.setProperty("--button", activeColor);
  }, []);

  // =========================
  // Handle Resize
  // =========================
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // =========================
  // Fetch Roles (on mount and route change)
  // =========================
  const emptyRole = { isSuperAdmin: false, modulePermissions: [{ module: "Dashboard" }] };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await apiGet("user/get-roles");
        if (data?.isSuccess && data.role) {
          setTabs(data.role);
          setActions(data.role);
          // Apply user's saved theme preference (persisted to profile)
          if (data.themePreference) {
            applyThemePreference(data.themePreference);
          }
        } else {
          setTabs(emptyRole);
          setActions(emptyRole);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
        setTabs(emptyRole);
        setActions(emptyRole);
      }
    };

    fetchRoles();
  }, [location.pathname, setTabs, setActions]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[var(--background)]">

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "h-full flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[var(--background)] transition-all duration-300",
            isSidebarOpen ? "w-64" : "w-20"
          )}
        >
          <SidebarMemo
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            isMobile={isMobile}
          />
        </aside>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <main
          className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 bg-[var(--background)]"
          key={location.pathname} // ensures Outlet remount per route change
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-30 flex lg:hidden">
          <div className="h-full w-64 border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[var(--background)]">
            <SidebarMemo
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
            />
          </div>
          <div className="flex-1 bg-black/40" onClick={toggleSidebar} />
        </div>
      )}
    </div>
  );
}

export default Layout;
