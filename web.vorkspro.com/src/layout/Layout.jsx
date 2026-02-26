import React, { useState, useEffect, useCallback, memo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { apiGet, apiPost } from "@/interceptor/interceptor";
import { THEMES_LIGHT, THEMES_DARK } from "@/constants/themes";
import { applyThemePreference, getThemePreference } from "@/lib/theme";
import { UserX, Loader2 } from "lucide-react";
import { toast } from "sonner";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { jwtDecode } from "jwt-decode";
import { useTabs } from "@/context/TabsContext";

// ====================
// No-role screen (assign default role or sign out)
// ====================
function NoRoleScreen({ setTabs, setActions }) {
  const [assigning, setAssigning] = useState(false);

  const handleAssignDefault = async () => {
    setAssigning(true);
    try {
      const data = await apiPost("user/assign-default-role");
      if (data?.isSuccess && data?.role) {
        setTabs(data.role);
        setActions(data.role);
        toast.success("Role assigned. Loading app…");
      } else {
        toast.error(data?.message || "Could not assign role.");
      }
    } catch (err) {
      toast.error(err?.message || "Could not assign default role.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-[var(--background)]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 max-w-md w-full text-center shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
          <UserX className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
          No role assigned
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Your account does not have a role yet. You can assign yourself the default role (if one exists) or sign out and ask an administrator to assign you a role.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleAssignDefault}
            disabled={assigning}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {assigning ? "Assigning…" : "Assign me the default role"}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
            }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--muted)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================
// Memoized Sidebar
// ====================
const SidebarMemo = memo(Sidebar);

function Layout() {
  const token = localStorage.getItem("token");
  let decodedToken = null;
  if (token && typeof token === "string" && token.trim().length > 0) {
    try {
      decodedToken = jwtDecode(token);
    } catch {
      decodedToken = null;
    }
  }

  const { tabs, setTabs, setActions } = useTabs();
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

  // When mode is light/dark, apply accent from localStorage (skip when preference is an accent key)
  useEffect(() => {
    const pref = getThemePreference();
    if (pref !== "light" && pref !== "dark") return;
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
        if (data?.noRole) {
          setTabs({ noRole: true });
          setActions({ noRole: true });
          return;
        }
        if (data?.isSuccess && data.role) {
          setTabs(data.role);
          setActions(data.role);
          // Apply user's saved theme and accent colors (persisted to profile)
          const themePreference = data.themePreference || data.role?.themePreference;
          const themeMode = data.themeMode || data.role?.themeMode;
          const lightColor = data.lightColor || data.role?.lightColor;
          const darkColor = data.darkColor || data.role?.darkColor;
          if (themeMode === "light" || themeMode === "dark") {
            try {
              localStorage.setItem("themeMode", themeMode);
              if (themeMode === "dark") document.documentElement.classList.add("dark");
              else document.documentElement.classList.remove("dark");
            } catch (_) {}
          }
          if (lightColor && THEMES_LIGHT[lightColor]) {
            try { localStorage.setItem("lightColor", lightColor); } catch (_) {}
          }
          if (darkColor && THEMES_DARK[darkColor]) {
            try { localStorage.setItem("darkColor", darkColor); } catch (_) {}
          }
          if (themePreference) {
            applyThemePreference(themePreference);
          }
        } else {
          setTabs(emptyRole);
          setActions(emptyRole);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
        const msg = error?.message ?? "";
        const isNoRole =
          msg.includes("No role assigned to the user") ||
          msg.includes("Your role is inactive or invalid");
        if (isNoRole) {
          setTabs({ noRole: true });
          setActions({ noRole: true });
        } else {
          setTabs({ loadFailed: true });
          setActions({ loadFailed: true });
        }
      }
    };

    fetchRoles();
  }, [location.pathname, setTabs, setActions]);

  const isLoading = tabs === null || tabs === undefined;
  const isNoRole = tabs && (tabs.noRole === true);
  const isLoadFailed = tabs && (tabs.loadFailed === true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (isNoRole) {
    return (
      <NoRoleScreen setTabs={setTabs} setActions={setActions} />
    );
  }

  if (isLoadFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-[var(--background)]">
        <p className="text-[var(--foreground)]">Could not load your session.</p>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "h-full flex-shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--background)] transition-all duration-300",
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
          <div className="h-full w-64 border-r border-[var(--border)] bg-[var(--background)] shadow-xl">
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
