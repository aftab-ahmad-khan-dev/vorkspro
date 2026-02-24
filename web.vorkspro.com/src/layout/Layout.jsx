import React, { useState, useEffect, useCallback, memo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { apiGet } from "@/interceptor/interceptor";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { jwtDecode } from "jwt-decode";
import { useTabs } from "@/context/TabsContext";

// ====================
// Helper: Deep Equality
// ====================
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

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

  // =========================
  // Apply Theme
  // =========================
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem("themeMode") || "light";
      const savedLightColor = localStorage.getItem("lightColor") || "blue";
      const savedDarkColor = localStorage.getItem("darkColor") || "blue";

      document.documentElement.classList.toggle("dark", savedTheme === "dark");

      const lightColors = {
        blue: "oklch(65.5% 0.178 247)",
        purple: "oklch(65% 0.15 270)",
        green: "oklch(70% 0.15 140)",
        orange: "oklch(70% 0.2 40)",
        pink: "oklch(70% 0.15 330)",
        teal: "oklch(65% 0.15 180)",
      };

      const darkColors = {
        blue: "oklch(45% 0.15 247)",
        purple: "oklch(45% 0.15 270)",
        green: "oklch(50% 0.15 140)",
        orange: "oklch(50% 0.2 40)",
        pink: "oklch(50% 0.15 330)",
        teal: "oklch(45% 0.15 180)",
      };

      const activeColor =
        savedTheme === "dark"
          ? darkColors[savedDarkColor]
          : lightColors[savedLightColor];

      document.documentElement.style.setProperty("--primary", activeColor);
      document.documentElement.style.setProperty("--button", activeColor);
    };

    applyTheme();
    const storageHandler = () => applyTheme();
    window.addEventListener("storage", storageHandler);
    return () => window.removeEventListener("storage", storageHandler);
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

  async function fetchRoles() {
    try {
      const data = await apiGet('user/get-roles');
      if (data?.isSuccess) {
        setRole(data.role)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  // =========================
  // Fetch Roles ON ROUTE CHANGE
  // =========================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await apiGet("user/get-roles");
        if (data?.isSuccess && data.role) {
          // Only update context if real change
          setTabs(prev => (!deepEqual(prev, data.role) ? data.role : prev));
          setActions(prev => (!deepEqual(prev, data.role) ? data.role : prev));
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
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
