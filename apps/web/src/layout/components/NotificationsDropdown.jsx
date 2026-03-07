import React, { useEffect, useState, useRef } from "react";
import { Bell, Calendar, ListTodo, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiGetByFilter, apiPatch } from "@/interceptor/interceptor";
import { cn } from "@/lib/utils";
import { useTabs } from "@/context/TabsContext";

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [todoReminders, setTodoReminders] = useState([]);
  const [followupReminders, setFollowupReminders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
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
  const hasTodoAccess = isSuperAdmin || allowedModuleNames.includes("My To-Do Hub");
  const hasFollowupAccess = isSuperAdmin || allowedModuleNames.includes("Follow-up-Hub");

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [];

      if (hasAnnouncementsAccess) {
        promises.push(
          apiGet("announcement/stats").then((r) => {
            setUnreadCount(r?.stats?.unRead || 0);
          }),
          apiGet("announcement/get-all?page=1&size=5").then((r) => {
            const sorted = (r?.announcements || []).sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
            });
            setAnnouncements(sorted);
          })
        );
      }

      if (hasTodoAccess) {
        promises.push(
          apiGet("todo/get-all").then((r) => {
            const todos = r?.filteredData?.todos || [];
            const now = new Date();
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);
            const reminders = todos.filter(
              (t) =>
                t.isRemainderSet &&
                !t.isCompleted &&
                t.dueDate &&
                new Date(t.dueDate) <= todayEnd
            );
            setTodoReminders(reminders.slice(0, 5));
          })
        );
      }

      if (hasFollowupAccess) {
        promises.push(
          apiGetByFilter("followup/get-by-filter", {
            page: 1,
            size: 5,
            type: "schedule-followup",
            assignedTo: "mine",
          }).then((r) => {
            const followups = r?.filteredData?.followups || [];
            const now = new Date();
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);
            const due = followups.filter(
              (f) =>
                f.date &&
                new Date(f.date) <= todayEnd &&
                f.status !== "completed"
            );
            setFollowupReminders(due.slice(0, 5));
          })
        );
      }

      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (announcementId) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a._id === announcementId
          ? { ...a, markAsRead: { ...(a.markAsRead || {}), isRead: true } }
          : a
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await apiPatch(`announcement/mark-as-read/${announcementId}`);
    } catch (error) {
      console.error("Failed to mark announcement as read", error);
    }
  };

  const hasAnyAccess = hasAnnouncementsAccess || hasTodoAccess || hasFollowupAccess;
  if (!hasAnyAccess) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative flex h-[42px] w-[42px] items-center justify-center rounded-xl",
          "bg-[var(--muted)]/80 hover:bg-[var(--accent)]",
          "text-[var(--foreground)]",
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
              Notifications
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

            {!loading && (
              <>
                {/* Announcements */}
                {hasAnnouncementsAccess && (
                  <>
                    {announcements.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Announcements
                      </div>
                    )}
                    {announcements.map((a) => (
                      <button
                        key={`ann-${a._id}`}
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
                  </>
                )}

                {/* Todo Reminders */}
                {hasTodoAccess && todoReminders.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide flex items-center gap-1.5">
                      <ListTodo className="h-3.5 w-3.5" />
                      Todo Reminders
                    </div>
                    {todoReminders.map((t) => (
                      <button
                        key={`todo-${t._id}`}
                        type="button"
                        className="w-full text-left px-3 py-3 border-b border-[var(--border)]/60 hover:bg-[var(--muted)]/40"
                        onClick={() => {
                          setOpen(false);
                          navigate("/app/my-todo-list");
                        }}
                      >
                        <p className="font-medium text-[var(--foreground)] line-clamp-1">
                          {t.title}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          Due {t.dueDate ? new Date(t.dueDate).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : ""}
                        </p>
                        {t.priority && (
                          <span className="text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600">
                            {t.priority}
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                )}

                {/* Follow-up Reminders */}
                {hasFollowupAccess && followupReminders.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wide flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Follow-up Reminders
                    </div>
                    {followupReminders.map((f) => (
                      <button
                        key={`fu-${f._id}`}
                        type="button"
                        className="w-full text-left px-3 py-3 border-b border-[var(--border)]/60 hover:bg-[var(--muted)]/40"
                        onClick={() => {
                          setOpen(false);
                          navigate("/app/follow-up-hub");
                        }}
                      >
                        <p className="font-medium text-[var(--foreground)] line-clamp-1">
                          {f.topic || "Follow-up"}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {f.client?.name} • {f.date ? new Date(f.date).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : ""}
                        </p>
                      </button>
                    ))}
                  </>
                )}

                {!loading &&
                  announcements.length === 0 &&
                  todoReminders.length === 0 &&
                  followupReminders.length === 0 && (
                    <div className="px-3 py-4 text-[var(--muted-foreground)] text-center">
                      No notifications
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;

