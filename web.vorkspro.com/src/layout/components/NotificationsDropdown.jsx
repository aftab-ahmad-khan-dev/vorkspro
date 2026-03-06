import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPatch } from "@/interceptor/interceptor";
import { cn } from "@/lib/utils";
import { useTabs } from "@/context/TabsContext";

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { tabs } = useTabs();

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
    : (tabs?.modulePermissions || []).map((perm) => perm.module);

  const hasAnnouncementsAccess =
    isSuperAdmin || allowedModuleNames.includes("Announcements");

  const fetchData = async () => {
    if (!hasAnnouncementsAccess) return;
    setLoading(true);
    try {
      const statsRes = await apiGet("announcement/stats");
      setUnreadCount(statsRes?.stats?.unRead || 0);

      const params = new URLSearchParams({
        page: 1,
        size: 5,
      });
      const listRes = await apiGet(`announcement/get-all?${params.toString()}`);
      const sorted = (listRes?.announcements || []).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
        );
      });
      setItems(sorted);
    } catch (error) {
      // optional: surface a toast from here if needed
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleMarkAsRead = async (announcementId) => {
    setItems((prev) =>
      prev.map((a) =>
        a._id === announcementId
          ? {
              ...a,
              markAsRead: {
                ...(a.markAsRead || {}),
                isRead: true,
              },
            }
          : a
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      await apiPatch(`announcement/mark-as-read/${announcementId}`);
    } catch (error) {
      console.error("Failed to mark announcement as read", error);
    }
  };

  if (!hasAnnouncementsAccess) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative flex h-[42px] w-[42px] items-center justify-center rounded-xl",
          "bg-[var(--muted)]/80 hover:bg-[var(--accent)]",
          "transition-all duration-300 hover:scale-[1.05] active:scale-95"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg z-20">
          <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Announcements
            </span>
            <button
              type="button"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={() => {
                setOpen(false);
                navigate("/app/announcements");
              }}
            >
              View all
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto text-sm">
            {loading && (
              <div className="px-3 py-4 text-[var(--muted-foreground)] text-center">
                Loading…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="px-3 py-4 text-[var(--muted-foreground)] text-center">
                No recent announcements
              </div>
            )}

            {!loading &&
              items.map((a) => (
                <button
                  key={a._id}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-3 border-b border-[var(--border)]/60 hover:bg-[var(--muted)]/40",
                    !a.markAsRead?.isRead && "bg-[var(--primary)]/3"
                  )}
                  onClick={() => {
                    setOpen(false);
                    navigate("/app/announcements");
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)] line-clamp-1">
                        {a.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                        {a.content}
                      </p>
                    </div>
                    {a.priority === "high" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-600">
                        High
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                    <span>{a.department?.name || "All"}</span>
                    {!a.markAsRead?.isRead && (
                      <button
                        type="button"
                        className="text-[10px] text-[var(--primary)] hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(a._id);
                        }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;

