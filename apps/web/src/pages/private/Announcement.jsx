import React, { useState, useEffect, useMemo } from "react";
import { Plus, Pin, Eye, MessageSquare, Calendar, User, TrendingUp, Send, Edit, Trash2, Trash, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import GlobalDialog from "@/models/GlobalDialog";
import AnnouncementDialog from "@/models/announcement/AnnouncementDialog";
import { apiGet, apiPatch, apiPost, apiDelete } from "@/interceptor/interceptor";
import { toast } from "sonner";
import Confirmation from "@/models/Confirmation";
import NewAnnouncementDialog from "@/models/announcement/NewAnnouncementDialog";
import { jwtDecode } from "jwt-decode";
import Chip from "@/components/Chip";
import Pagination from "@/components/UsePagination";
import TimeAgo from "react-timeago";
import { useTabs } from "@/context/TabsContext";
import EmptyState from "@/components/EmptyState";
import { ViewToggle, KanbanBoard, CalendarWrapper } from "@/components/views";

const ANNOUNCEMENT_KANBAN_COLUMNS = [
  { id: "pinned", title: "Pinned" },
  { id: "unpinned", title: "Unpinned" },
];

function Announcement() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [pagination, setPagination] = useState({ page: 1, size: 10, totalPages: 1, totalItems: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const commentsEndRef = React.useRef(null);
  const token = localStorage.getItem('token')
  const user = jwtDecode(token)
  const [markAsReadLoading, setMarkAsReadLoading] = useState({});
  const [addCommentLoading, setAddCommentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { actions } = useTabs()
  const isSuperAdmin = actions?.isSuperAdmin ?? false;
  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchAnnouncements();
  }, [activeTab, selectedSubDepartment, pagination.page, debouncedSearch]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        size: pagination.size,
        ...(activeTab !== "all" && { department: activeTab }),
        ...(selectedSubDepartment && { subDepartment: selectedSubDepartment }),
        ...(debouncedSearch && { search: debouncedSearch })
      });
      const data = await apiGet(`announcement/get-all?${params}`);
      const sorted = (data?.announcements || []).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      });
      setAnnouncements(sorted);
      setPagination(prev => ({
        ...prev,
        totalPages: data?.pagination?.totalPages || 1,
        totalItems: data?.pagination?.totalItems || 0
      }));
    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };
  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.actions.includes(requiredAction)
        }
      }
    );
  };

  const timeFormatter = (value, unit) => {
    if (unit === "second") return "just now";
    if (value === 1) return `a ${unit} ago`;
    return `${value} ${unit}s ago`;
  };

  const handleAnnouncementSuccess = (updatedAnnouncement, isNew) => {
    if (isNew) {
      setStats(prev => ({
        ...prev,
        totalAnnouncement: (prev?.totalAnnouncement || 0) + 1,
        ...(updatedAnnouncement.isPinned && { pinnedAnnouncement: (prev?.pinnedAnnouncement || 0) + 1 }),
        ...(updatedAnnouncement.priority === 'high' && { high: (prev?.high || 0) + 1 })
      }));
    } else {
      const oldAnnouncement = announcements.find(a => a._id === updatedAnnouncement._id);
      if (oldAnnouncement) {
        setStats(prev => ({
          ...prev,
          ...(oldAnnouncement.isPinned !== updatedAnnouncement.isPinned && {
            pinnedAnnouncement: updatedAnnouncement.isPinned
              ? (prev?.pinnedAnnouncement || 0) + 1
              : Math.max(0, (prev?.pinnedAnnouncement || 0) - 1)
          }),
          ...(oldAnnouncement.priority !== updatedAnnouncement.priority && {
            ...(oldAnnouncement.priority === 'high' && { high: Math.max(0, (prev?.high || 0) - 1) }),
            ...(updatedAnnouncement.priority === 'high' && { high: (prev?.high || 0) + 1 })
          })
        }));
      }
    }
    setDialogOpen(false);
    setEditingAnnouncement(null);
    fetchAnnouncements();
    fetchStats();
  };

  const handleMarkAsRead = async (announcementId) => {
    setAnnouncements(prev =>
      prev.map(a => a._id === announcementId ? {
        ...a,
        markAsRead: {
          employee: { user: user._id },
          isRead: true,
          readAt: new Date()
        }
      } : a)
    );
    setStats(prev => ({ ...prev, unRead: Math.max(0, (prev?.unRead || 0) - 1) }));
    setMarkAsReadLoading(prev => ({ ...prev, [announcementId]: true }));
    try {
      await apiPatch(`announcement/mark-as-read/${announcementId}`);
      toast.success("Marked as read");
    } catch (error) {
      toast.error(error.message || "Failed to mark as read");
      setAnnouncements(prev =>
        prev.map(a => a._id === announcementId ? { ...a, markAsRead: null } : a)
      );
      setStats(prev => ({ ...prev, unRead: (prev?.unRead || 0) + 1 }));
    } finally {
      setMarkAsReadLoading(prev => ({ ...prev, [announcementId]: false }));
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiGet("department/get-all");
      setDepartments(data.filteredData.departments || []);
    } catch (error) {
      toast.error("Failed to load departments");
      return [];
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiGet("announcement/stats");
      setStats(data.stats || {});
    } catch (error) {
      console.error("Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchComments = async (announcementId) => {
    setCommentsLoading(true);
    try {
      const data = await apiGet(`announcement/get-comments/${announcementId}`);
      setComments(data.comments || []);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddCommentLoading(true);
    try {
      const response = await apiPost(`announcement/post-comments/${selectedAnnouncement._id}`, { comment: newComment });
      const addedComment = response.comment || {
        _id: Date.now().toString(),
        comment: newComment,
        commentBy: { firstName: "You" },
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, addedComment]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.message || "Failed to add comment");
    } finally {
      setAddCommentLoading(false);
    }
  };

  React.useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleViewComments = (announcement) => {
    setSelectedAnnouncement(announcement);
    setCommentsOpen(true);
    fetchComments(announcement._id);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const announcementCalendarEvents = useMemo(() => {
    return (announcements || [])
      .filter((a) => a.createdAt)
      .map((a) => ({
        id: a._id,
        title: a.title,
        start: new Date(a.createdAt),
        end: new Date(a.createdAt),
        resource: a,
      }));
  }, [announcements]);

  const handleAnnouncementMove = async (announcementId, _from, toColumnId) => {
    const isPinned = toColumnId === "pinned";
    const oldAnn = announcements.find((a) => a._id === announcementId);
    const delta = (isPinned ? 1 : 0) - (oldAnn?.isPinned ? 1 : 0);
    const prevAnnouncements = announcements;
    const prevStats = stats;
    setAnnouncements((prev) =>
      prev.map((a) => (a._id === announcementId ? { ...a, isPinned } : a))
    );
    setStats((prev) => ({
      ...prev,
      pinnedAnnouncement: Math.max(0, (prev?.pinnedAnnouncement || 0) + delta),
    }));
    try {
      await apiPatch(`announcement/update/${announcementId}`, { isPinned });
      toast.success(isPinned ? "Announcement pinned" : "Announcement unpinned");
    } catch (error) {
      setAnnouncements(prevAnnouncements);
      setStats(prevStats);
      toast.error(error?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const announcementToDelete = announcements.find(a => a._id === confirmDelete);
    setDeleteLoading(prev => ({ ...prev, [confirmDelete]: true }));
    try {
      await apiDelete(`announcement/delete/${confirmDelete}`);
      setAnnouncements(prev => prev.filter(a => a._id !== confirmDelete));
      if (announcementToDelete) {
        setStats(prev => ({
          ...prev,
          totalAnnouncement: Math.max(0, (prev?.totalAnnouncement || 0) - 1),
          ...(announcementToDelete.isPinned && { pinnedAnnouncement: Math.max(0, (prev?.pinnedAnnouncement || 0) - 1) }),
          ...(announcementToDelete.priority === 'high' && { high: Math.max(0, (prev?.high || 0) - 1) })
        }));
      }
      toast.success('Announcement deleted successfully');
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete announcement');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [confirmDelete]: false }));
    }
  };

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Announcements
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Company-wide updates and communications
            </p>
          </div>
          {hasPermission("Announcements", "Create Records") &&
            <Button className="bg-black hover:bg-black/80 transition-all ease-in w-full sm:w-auto" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Announcement
            </Button>
          }
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${user?.isSuperAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4 mb-8`}>
        {statsLoading ? (
          Array.from({ length: user?.isSuperAdmin ? 3 : 4 }).map((_, i) => (
            <div key={i} className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        ) : (
          <>
            {/* Total */}
            <div
              className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Total</h3>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)] mb-1">{stats?.totalAnnouncement || 0}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Announcements</p>
            </div>

            {/* Pinned */}
            <div
              className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Pin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Pinned</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">{stats?.pinnedAnnouncement || 0}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Important updates</p>
            </div>

            {/* Unread - only non-SuperAdmin */}
            {!user?.isSuperAdmin && (
              <div
                className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Unread</h3>
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">{stats?.unRead || 0}</p>
                <p className="text-sm text-[var(--muted-foreground)]">Unread announcements</p>
              </div>
            )}

            {/* High Priority */}
            <div
              className="p-6 border border-[var(--border)] rounded-2xl bg-[var(--background)]/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">High</h3>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-1">{stats?.high || 0}</p>
              <p className="text-sm text-[var(--muted-foreground)]">High priority</p>
            </div>
          </>
        )}
      </div>


      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <ViewToggle
          value={viewMode}
          onValueChange={setViewMode}
          enabledViews={["list", "calendar", "kanban"]}
          listLabel="List"
        />
      </div>

      {viewMode === "calendar" && (
        <div className="mb-6 p-1">
          <CalendarWrapper events={announcementCalendarEvents} style={{ height: 540 }} />
        </div>
      )}

      {viewMode === "kanban" && (
        <div className="mb-6">
          <KanbanBoard
            columns={ANNOUNCEMENT_KANBAN_COLUMNS}
            items={announcements}
            getColumnId={(a) => (a.isPinned ? "pinned" : "unpinned")}
            getItemId={(a) => a._id}
            onMove={handleAnnouncementMove}
            renderCard={(a) => (
              <div>
                <h4 className="font-semibold text-sm truncate">{a.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                </p>
                {a.department?.name && (
                  <p className="text-xs text-[var(--muted-foreground)]">{a.department.name}</p>
                )}
              </div>
            )}
          />
        </div>
      )}

      {viewMode === "list" && user?.isSuperAdmin && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          {hasPermission("Announcements", "Filter Records") &&
            <Select value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedSubDepartment(""); setPagination(prev => ({ ...prev, page: 1 })); }}>
              <SelectTrigger className="w-full sm:w-[200px] border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>}
          {activeTab !== "all" && departments.find(d => d._id === activeTab)?.subDepartments?.length > 0 && (
            <Select value={selectedSubDepartment} onValueChange={(val) => { setSelectedSubDepartment(val); setPagination(prev => ({ ...prev, page: 1 })); }}>
              <SelectTrigger className="w-full sm:w-[200px] border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select subdepartment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem>All Subdepartments</SelectItem>
                {departments.find(d => d._id === activeTab)?.subDepartments?.map((subDept) => (
                  <SelectItem key={subDept._id} value={subDept._id}>{subDept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {viewMode === "list" && (
      <div className="w-full">
        {activeTab === "all" && (
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 p-4 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Skeleton className="h-8 w-full sm:w-32" />
                      <Skeleton className="h-8 w-full sm:w-28" />
                    </div>
                  </div>
                </div>
              ))
              
            ) : (
              <AnimatePresence>
                {announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-[var(--border)]/80 transition-all duration-300"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {announcement.isPinned && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-border">
                                <Pin className="w-4 h-4 " />
                              </div>
                            )}
                            <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] transition-colors">
                              {announcement.title}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--muted-foreground)]">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate max-w-[150px] sm:max-w-none">{announcement.createdBy?.email || "Unknown"}</span>
                            </div>
                            <span className="text-[var(--border)]">•</span>
                            <Chip status={announcement.department?.name || "All"}></Chip>
                            <span className="text-[var(--border)]">•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-4 leading-relaxed">
                        {announcement.content}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-[var(--border)]/50">
                        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                          <Chip status={announcement.priority}></Chip>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button size="sm" className="text-xs flex-1 sm:flex-none" onClick={() => handleViewComments(announcement)}>
                            View Comments
                          </Button>
                          <>
                            { hasPermission("Announcements", "Edit Records") && (
                              <Button size="sm" className="text-xs border-button" onClick={() => handleEdit(announcement)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission("Announcements", "Delete Records") && (
                              <Button size="sm" className="text-xs logout-button" onClick={() => setConfirmDelete(announcement._id)} disabled={deleteLoading[announcement._id]}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                          {user.isSuperAdmin == false && (
                            <Button disabled={announcement?.markAsRead?.employee?.user == user?._id || markAsReadLoading[announcement._id]} size="sm" className="text-xs flex-1 sm:flex-none" onClick={() => handleMarkAsRead(announcement._id)}>
                              {
                                markAsReadLoading[announcement._id] ? 'Loading...' : announcement.markAsRead?.employee?.user == user?._id ? 'Marked as Read' : 'Mark as Read'
                              }
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {!loading && announcements.length === 0 && (
              <EmptyState 
                icon={MessageSquare}
                title="No announcements found"
                subtitle="Create your first announcement to get started"
              />
            )}
          </div>
        )}

        {departments.map((dept) => (
          activeTab === dept._id && (
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 p-4 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex items-center justify-between pt-4">
                      <Skeleton className="h-6 w-20" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <AnimatePresence>
                  {announcements.map((announcement, index) => (
                    <motion.div
                      key={announcement._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-[var(--border)]/80 transition-all duration-300"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {announcement.isPinned && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-border">
                                  <Pin className="w-4 h-4 " />
                                </div>
                              )}
                              <h3 className="text-xl font-semibold text-[var(--foreground)]  transition-colors">
                                {announcement.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{announcement.createdBy?.name || "Unknown"}</span>
                              </div>
                              <span className="text-[var(--border)]">•</span>
                              <span className="px-2 py-1 rounded-full bg-[var(--border)]/50 text-xs font-medium">
                                {announcement.department?.name || "All"}
                              </span>
                              <span className="text-[var(--border)]">•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-[var(--muted-foreground)] mb-4 leading-relaxed">
                            {announcement.content}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[var(--border)]/50">
                            <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                              <Chip status={announcement.priority}></Chip>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="text-xs" onClick={() => handleViewComments(announcement)}>
                                View Comments
                              </Button>
                              {user.isSuperAdmin && (
                                <>
                                  <Button size="sm" className="text-xs border-button" onClick={() => handleEdit(announcement)}>
                                    <Pencil />
                                  </Button>
                                  <Button size="sm" className="text-xs logout-button" onClick={() => setConfirmDelete(announcement._id)} disabled={deleteLoading[announcement._id]}>
                                    {deleteLoading[announcement._id] ? <Trash2 /> : <Trash2 />}
                                  </Button>
                                </>
                              )}
                              {user.isSuperAdmin == false && (
                                <Button disabled={announcement?.markAsRead?.employee?.user == user?._id || markAsReadLoading[announcement._id]} size="sm" className="text-xs" onClick={() => handleMarkAsRead(announcement._id)}>
                                  {
                                    markAsReadLoading[announcement._id] ? 'Loading...' : announcement.markAsRead?.employee?.user == user?._id ? 'Marked as Read' : 'Mark as Read'
                                  }
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {!loading && announcements.length === 0 && (
                <EmptyState 
                  icon={MessageSquare}
                  title="No announcements found"
                  subtitle="No announcements available for this department"
                />
              )}
            </div>
          )
        ))}

        {!loading && announcements.length > 0 && pagination.totalPages > 1 && (
          <Pagination
            total={pagination.totalItems}
            current={pagination.page}
            pageSize={pagination.size}
            lastPage={pagination.totalPages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        )}
      </div>
      )}

      <GlobalDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAnnouncement(null);
        }}
        label={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
      >
        <NewAnnouncementDialog
          announcement={editingAnnouncement}
          onSuccess={(updatedAnnouncement) => handleAnnouncementSuccess(updatedAnnouncement, !editingAnnouncement)}
          departments={departments}
          onClose={() => {
            setDialogOpen(false);
            setEditingAnnouncement(null);
          }}
        />
      </GlobalDialog>

      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader className="border-b border-[var(--border)] pb-3">
            <SheetTitle className="text-left">
              <div className="space-y-1">
                <p className="text-sm text-[var(--muted-foreground)]">Comments on</p>
                <p className="text-base font-semibold text-foreground truncate">{selectedAnnouncement?.title}</p>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto pb-4">
            {commentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="p-2 md:p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]/50">
                    <div className="flex items-start gap-3 w-full break-words">
                      {/* Avatar */}
                      <div className="w-8 h-8 min-w-[2rem] rounded-full bg-[var(--border)] flex items-center justify-center text-foreground">
                        <User className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Name + Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 md:justify-between mb-1">
                          <span className="text-xs md:text-sm font-medium text-foreground truncate sm:truncate-none">
                            {comment.commentBy?.firstName ||
                              comment.commentBy?.email ||
                              "Super Admin"}
                          </span>

                          <span className="text-xs text-[var(--muted-foreground)] flex">
                            <TimeAgo
                              date={comment.createdAt}
                              live={false}
                              formatter={timeFormatter}
                            />
                          </span>

                        </div>

                        {/* Comment text */}
                        <p className="text-sm text-[var(--muted-foreground)] break-words whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
            ) : (
              // <p className="text-center text-[var(--muted-foreground)] py-8">No comments yet</p>
              <EmptyState icon={MessageSquare} title="No comments yet" subtitle="Kindly send your comments against this announcement."></EmptyState>
            )}
          </div>

          <div className="sticky bottom-0 bg-[var(--background)] pt-4 border-t border-[var(--border)] space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] sm:min-h-[80px] text-foreground resize-none"
            />
            <Button onClick={handleAddComment} className="w-full" disabled={!newComment.trim() || addCommentLoading}>
              <Send className="w-4 h-4 mr-2" />
              {addCommentLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Confirmation
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        name="Announcement"
      />
    </div>
  );
}

export default Announcement;