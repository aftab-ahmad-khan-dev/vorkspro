import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  TrendingUp,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog";
import AddMilestoneDialog from "@/models/task/AddMilestoneDialog";
import Confirmation from "@/models/Confirmation";
import { toast } from "sonner";
import Pagination from "@/components/UsePagination";
import StatCard from "@/components/Stats";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Calendar
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { startOfMonth, endOfMonth, format } from "date-fns";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import MilestoneEvents from "@/components/MilestoneEvents";
import { useTabs } from "@/context/TabsContext";
import CustomTooltip from "@/components/Tooltip";
import EmptyState from "@/components/EmptyState";
import { apiGet, apiGetByFilter, apiPatch, apiPost } from "@/interceptor/interceptor";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

function Task() {
  const [activeTab, setActiveTab] = useState("milestones");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  // Selected project from sidebar
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date()); // Current visible month
  const [calendarMilestones, setCalendarMilestones] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // List view data with server-side pagination
  const [filteredMilestones, setFilteredMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [milestoneStats, setMilestoneStats] = useState({});
  const [inprogressProjects, setInprogressProjects] = useState([]);

  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 12,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  const { actions } = useTabs();
  const [editMilestone, setEditMilestone] = useState(null);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;
    return actions?.modulePermissions?.some((modules) => {
      const currentModule = modules.module === moduleName;
      if (currentModule) {
        return modules.actions.includes(requiredAction);
      }
      return false;
    });
  };

  const tabsPermission = (moduleName, tabs) => {
    if (isSuperAdmin) return true;
    const module = actions?.modulePermissions?.find(
      (modules) => modules.module === moduleName
    );
    if (!module) return false;
    return module.tabs.some((action) =>
      tabs.includes(action)
    );
  }
  const allowedTabs = useMemo(() => {
    const tabs = [];

    if (tabsPermission("Milestones", ["Milestones"])) {
      tabs.push("milestones");
    }

    if (tabsPermission("Milestones", ["Calender View"])) {
      tabs.push("calendar");
    }

    return tabs;
  }, [actions, isSuperAdmin]);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "");
    }
  }, [allowedTabs, activeTab]);
  // Kanban & Static Tasks (unchanged)
  const [kanbanColumns] = useState({
    pending: [
      {
        id: "1",
        title: "UI Design Review",
        assignee: "MC",
        priority: "medium",
      },
    ],
    "in-progress": [
      { id: "2", title: "API Integration", assignee: "SJ", priority: "high" },
      {
        id: "3",
        title: "Bug Fixes - Checkout Flow",
        assignee: "SJ",
        priority: "critical",
      },
    ],
    review: [
      {
        id: "4",
        title: "Database Migration",
        assignee: "EW",
        priority: "high",
      },
    ],
    completed: [
      {
        id: "5",
        title: "User Authentication",
        assignee: "EW",
        priority: "high",
      },
    ],
  });

  const tasks = [
    {
      id: "1",
      title: "API Integration",
      project: "E-commerce Platform",
      assignee: "SJ",
      assigneeName: "Sarah Johnson",
      priority: "high",
      status: "In-Progress",
      dueDate: "2025-10-15",
      progress: 75,
    },
    {
      id: "2",
      title: "UI Design Review",
      project: "Mobile App Redesign",
      assignee: "MC",
      assigneeName: "Mike Chen",
      priority: "medium",
      status: "Pending",
      dueDate: "2025-10-18",
      progress: 30,
    },
    {
      id: "3",
      title: "Database Migration",
      project: "CRM System",
      assignee: "EW",
      assigneeName: "Emma Wilson",
      priority: "high",
      status: "Completed",
      dueDate: "2025-10-10",
      progress: 100,
    },
    {
      id: "4",
      title: "Bug Fixes - Checkout Flow",
      project: "E-commerce Platform",
      assignee: "SJ",
      assigneeName: "Sarah Johnson",
      priority: "critical",
      status: "In-Progress",
      dueDate: "2025-10-12",
      progress: 90,
    },
  ];

  const taskStats = [
    {
      title: "Completed Tasks",
      value: "892",
      icon: <CheckCircle size={20} className="text-green-600" />,
      change: 12,
    },
    {
      title: "In Progress",
      value: "47",
      icon: <Clock size={20} className="text-blue-600" />,
      change: 5,
    },
    {
      title: "Overdue Tasks",
      value: "6",
      icon: <AlertTriangle size={20} className="text-red-600" />,
      change: -3,
    },
    {
      title: "Productivity",
      value: "94%",
      icon: <TrendingUp size={20} className="text-purple-600" />,
      change: 2,
    },
  ];

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In-Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMilestoneStatusClass = (status) => {
    switch (status) {
      case "not started":
        return "bg-gray-100 text-gray-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "delayed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragEnd = (event) => {
    setActiveId(null);
  };

  const DraggableTask = ({ task, columnName }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: `${columnName}:${task.id}`,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 0,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border border-[var(--border)] hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3 ${isDragging ? "shadow-2xl ring-4 ring-blue-500/50" : ""
          }`}
        {...attributes}
        {...listeners}
      >
        <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span>{task.assignee}</span>
          <span
            className={`px-2 py-1 rounded-full font-medium ${getPriorityBadgeClass(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        </div>
      </div>
    );
  };

  const DroppableColumn = ({ columnName, columnTasks, columnTitle }) => {
    const { setNodeRef, isOver } = useDroppable({ id: columnName });
    return (
      <div
        ref={setNodeRef}
        className={`p-6 rounded-lg border border-[var(--border)] transition-all min-h-[400px] ${isOver ? "bg-blue-50/50 ring-2 ring-blue-400" : ""
          }`}
      >
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <span className="text-sm font-medium uppercase">{columnTitle}</span>
          <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600">
            {columnTasks.length}
          </span>
        </h3>
        <SortableContext
          items={columnTasks.map((t) => `${columnName}:${t.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {columnTasks.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                columnName={columnName}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    );
  };

  // API Calls (use interceptor for same base URL and auth)
  const fetchInprogressProjects = async () => {
    try {
      const data = await apiGet("project/get-inprogress");
      if (data?.isSuccess) {
        setInprogressProjects(data.filteredData?.projects || []);
      } else {
        setInprogressProjects([]);
        toast.error(data?.message || "Failed to load projects.");
      }
    } catch (err) {
      console.error(err);
      setInprogressProjects([]);
      const m = err?.message || "";
      const isNetwork = /failed to fetch|networkerror|load failed/i.test(m);
      const msg = isNetwork
        ? "Unable to connect to the server. Please check your connection and that the API is running."
        : m.toLowerCase().includes("permission")
          ? "You don't have permission to view projects."
          : "Failed to load projects.";
      toast.error(msg);
    }
  };

  const fetchMilestonesWithPagination = async () => {
    setLoading(true);
    try {
      const params = {
        page: paginationData.page,
        size: paginationData.size,
        ...(selectedProjectId && { projectId: selectedProjectId }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm.trim() && { search: searchTerm.trim() })
      };
      const data = await apiGetByFilter("milestone/get-by-filter", params);
      if (data?.isSuccess) {
        setFilteredMilestones(data.filteredData?.milestones || []);
        setPaginationData(prev => ({
          ...prev,
          totalItems: data.filteredData?.totalCount || data.filteredData?.milestones?.length || 0,
          totalPages: data.filteredData?.totalPages || Math.ceil((data.filteredData?.totalCount || data.filteredData?.milestones?.length || 0) / prev.size),
          lastPage: data.filteredData?.totalPages || Math.ceil((data.filteredData?.totalCount || data.filteredData?.milestones?.length || 0) / prev.size)
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestoneStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiGet("milestone/get-stats");
      setMilestoneStats(data?.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch milestones for current calendar month
  const fetchCalendarMilestones = useCallback(
    async (date) => {
      setCalendarLoading(true);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const params = {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      };

      try {
        const data = await apiGetByFilter("milestone/get-by-date", params);
        if (data?.isSuccess) {
          setCalendarMilestones(data.milestones || []);
        } else {
          toast.error("Failed to load milestones for this month");
          setCalendarMilestones([]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading calendar data");
        setCalendarMilestones([]);
      } finally {
        setCalendarLoading(false);
      }
    },
    []
  );

  const changeMilestoneStatus = async (id, status) => {
    try {
      const data = await apiPatch(`milestone/change-status/${id}`, { status });
      if (data?.isSuccess) {
        toast.success("Status updated!");
        fetchMilestonesWithPagination();
        fetchMilestoneStats();
        if (activeTab === "calendar") fetchCalendarMilestones(calendarDate);
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleDelete = (m) => {
    setSelectedMilestone(m);
    setOpenConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiPost(`milestone/delete/${selectedMilestone._id}`);
      toast.success("Deleted!");
      fetchMilestonesWithPagination();
      fetchMilestoneStats();
      if (activeTab === "calendar") fetchCalendarMilestones(calendarDate);
    } catch (err) {
      toast.error("Failed");
    } finally {
      setOpenConfirmation(false);
    }
  };

  const handleEdit = (m) => {
    setEditMilestone(m);
    setShowMilestoneDialog(true);
  };

  const handleCreate = () => {
    setEditMilestone(null);
    setShowMilestoneDialog(true);
  };

  const onMilestoneSuccess = () => {
    setShowMilestoneDialog(false);
    fetchMilestonesWithPagination();
    fetchMilestoneStats();
    if (activeTab === "calendar") fetchCalendarMilestones(calendarDate);
  };



  // Initial loads
  useEffect(() => {
    fetchMilestoneStats();
    fetchInprogressProjects();
  }, []);

  // Fetch milestones when filters or pagination changes
  useEffect(() => {
    if (activeTab === "milestones") {
      fetchMilestonesWithPagination();
    }
  }, [activeTab, paginationData.page, paginationData.size, selectedProjectId, statusFilter, searchTerm]);

  // Load calendar data when tab is active or date changes
  useEffect(() => {
    if (activeTab === "calendar") {
      fetchCalendarMilestones(calendarDate);
    }
  }, [activeTab, calendarDate, fetchCalendarMilestones]);

  // Reset page on filter change
  useEffect(() => {
    setPaginationData((prev) => ({ ...prev, page: 1 }));
  }, [selectedProjectId, statusFilter, searchTerm]);

  const pageChange = (p) => {
    setPaginationData((prev) => ({ ...prev, page: p }));
  };

  // Calendar Events
  const calendarEvents = useMemo(() => {
    return calendarMilestones
      .filter((m) => m.endDate)
      .map((m) => ({
        id: m._id,
        title: `${m.name} (${m.project?.name || "No Project"})`,
        start: new Date(m.endDate),
        end: new Date(m.endDate),
        allDay: true,
        resource: m,
        backgroundColor:
          m.status === "completed"
            ? "#10b981"
            : m.status === "delayed"
              ? "#f59e0b"
              : m.status === "in progress"
                ? "#3b82f6"
                : "#6b7280",
      }));
  }, [calendarMilestones]);

  const MilestoneSkeleton = () => (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)] animate-pulse space-y-5">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-[var(--border)] rounded"></div>
          <div className="h-4 w-32 bg-[var(--border)] rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-[var(--border)] rounded-md"></div>
          <div className="h-9 w-9 bg-[var(--border)] rounded-md"></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-[var(--border)] rounded"></div>
        <div className="h-5 w-16 bg-[var(--border)] rounded-full"></div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <div className="h-3 w-16 bg-[var(--border)] rounded"></div>
          <div className="h-3 w-10 bg-[var(--border)] rounded"></div>
        </div>
        <div className="h-2 w-full bg-[var(--border)] rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-17 w-full bg-[var(--border)] rounded"></div>
          {/* <div className="h-4 w-16 bg-[var(--border)] rounded"></div> */}
        </div>
        <div className="space-y-2">
          <div className="h-17 w-full bg-[var(--border)] rounded"></div>
          {/* <div className="h-4 w-20 bg-[var(--border)] rounded"></div> */}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <div className="h-10 w-30 bg-[var(--border)] rounded-md mt-2"></div>
        <div className="h-10 w-10 bg-[var(--border)] rounded-md mt-2"></div>
        <div className="h-10 w-10 bg-[var(--border)] rounded-md mt-2"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-[var(--foreground)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Milestone Management</h1>
          <p className="mt-1">Manage project and track milestones</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {activeTab === "milestones" || activeTab === "calendar" ? (
          <>
            <StatCard
              title="Not Started"
              isLoading={statsLoading}
              value={milestoneStats.notStarted}
            />
            <StatCard
              title="In Progress"
              isLoading={statsLoading}
              value={milestoneStats.inProgress}
              valueClass="text-orange-600"
            />
            <StatCard
              title="Completed"
              isLoading={statsLoading}
              value={milestoneStats.completed}
              valueClass="text-green-600"
            />
            <StatCard
              title="Total Milestones"
              isLoading={statsLoading}
              value={milestoneStats.totalMilestones}
              valueClass="text-blue-600"
            />
          </>
        ) : (
          taskStats.map((s, i) => (
            <div
              key={i}
              className="rounded-lg p-6 border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">{s.title}</h3>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--muted)]">
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-bold mb-2">{s.value}</p>
              {s.change && (
                <p
                  className={`text-sm ${s.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {s.change > 0 ? "Up" : "Down"} {Math.abs(s.change)}%
                </p>
              )}
            </div>
          ))
        )}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {allowedTabs.length >= 2 && (
          <TabsList className="sm:flex hidden mb-6 rounded-2xl bg-[var(--foreground)]/10">
            {allowedTabs.includes("milestones") && (

              <TabsTrigger
                value="milestones"
                className="rounded-2xl py-2 text-sm font-medium"
              >
                Milestones
              </TabsTrigger>
            )
            }

            {allowedTabs.includes("calendar") && (
              <TabsTrigger
                value="calendar"
                className="rounded-2xl py-2 text-sm font-medium"
              >
                Calendar View
              </TabsTrigger>)}
          </TabsList>
        )}
        {allowedTabs.length >= 2 && (
          <div className="sm:hidden text-[var(--foreground)] mb-3">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {allowedTabs.includes("milestones") && (
                  <SelectItem value="milestones">Milestones</SelectItem>
                )}
                {allowedTabs.includes("calendar") && (
                  <SelectItem value="calendar">Calendar View</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>)}

        {/* Milestones Tab - Unchanged */}
        <TabsContent value="milestones">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-2 xl:col-span-1">
              <div className="rounded-2xl border border-[var(--border)] p-5 bg-[var(--background)] sticky top-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                <h3 className="font-semibold text-lg mb-4">Projects</h3>
                <Button
                  className={`w-full justify-start mb-2 border-button ${selectedProjectId == null
                    ? "border border-[var(--button)] bg-[var(--button)]/10 text-[var(--button)]"
                    : ""
                    }`}
                  onClick={() => setSelectedProjectId(null)}
                >
                  All Projects
                </Button>
                {inprogressProjects.map((project) => (
                  <Button
                    key={project._id}
                    className={`w-full bg-transparent justify-start mb-2 border-button text-left ${project?._id === selectedProjectId
                      ? "border border-[var(--button)] bg-[var(--button)]/10 text-[var(--button)]"
                      : ""
                      }`}
                    onClick={() => setSelectedProjectId(project._id)}
                  >
                    <span className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--button)] mr-3"></div>
                      {project.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-6">
              <div className="border border-[var(--border)] rounded-2xl p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold">
                    {selectedProjectId
                      ? inprogressProjects.find(
                        (p) => p._id === selectedProjectId
                      )?.name || "Milestones"
                      : "All Milestones"}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="not started">Not Started</SelectItem>
                        <SelectItem value="in progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>

                    {hasPermission("Milestones", "Create Records") && (
                      <Button onClick={handleCreate}>
                        <Plus size={18} className="mr-2" /> Add Milestone
                      </Button>
                    )}

                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                      />
                      <Input
                        placeholder="Search milestones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <MilestoneSkeleton key={i} />
                    ))
                  ) : filteredMilestones.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState
                        icon={CheckCircle}
                        title="No milestones found"
                        subtitle="Try adjusting your filters or create your first milestone"
                      />
                    </div>
                  ) : (
                    filteredMilestones.map((m) => (
                      <div
                        key={m._id}
                        className="
    group
    p-4 sm:p-6
    rounded-2xl
    border border-[var(--border)]
    bg-[var(--background)]
    shadow-sm
    hover:shadow-lg hover:border-[var(--button)]/30
    transition-all duration-300
  "
                      >
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1 mb-1 text-[var(--button)] transition-colors">
                              {m.name}
                            </h3>

                            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--muted-foreground)] min-w-0">
                              <svg
                                className="w-4 h-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                              </svg>
                              <span className="truncate">
                                {m.project?.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                          <span className="text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
                            Status:
                          </span>

                          <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                            {m.endDate &&
                              m.status !== "completed" &&
                              new Date(m.endDate) <
                              new Date(new Date().setHours(0, 0, 0, 0)) && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-500/20">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Overdue
                                </span>
                              )}

                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getMilestoneStatusClass(
                                m.status
                              )}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current" />
                              {m.status.replace(/\b\w/g, (l) =>
                                l.toUpperCase()
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-4" />

                        {/* Info Grid */}
                        <div className={`grid grid-cols-1 ${actions.cost ? "sm:grid-cols-2" : "sm:grid-cols-1"} gap-3 sm:gap-4 mb-5`}>
                          {actions.cost &&
                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--border)]/30 hover:bg-[var(--border)]/50 transition-colors">
                              <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-[11px] sm:text-xs font-medium uppercase tracking-wide">
                                <svg
                                  className="w-4 h-4 shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Cost
                              </div>
                              <p className="font-bold text-base sm:text-lg text-[var(--foreground)]">
                                ${m.cost?.toLocaleString() || 0}
                              </p>
                            </div>}

                          <div className="flex flex-col gap-1 p-3 rounded-lg bg-[var(--border)]/30 hover:bg-[var(--border)]/50 transition-colors">
                            <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-[11px] sm:text-xs font-medium uppercase tracking-wide">
                              <svg
                                className="w-4 h-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Due Date
                            </div>
                            <p className="font-bold text-base sm:text-lg text-[var(--foreground)]">
                              {m.endDate
                                ? new Date(m.endDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                                : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                          {/* View Details (Primary Action) */}
                          {hasPermission("Milestones", "View Details") && (
                            <Button
                              className="border-button"
                              onClick={() =>
                                navigate(`/app/milestones/milestone-detail/${m._id}`)
                              }
                            >
                              <span className="whitespace-nowrap">
                                View Details
                              </span>
                            </Button>
                          )}

                          {/* Secondary Actions */}
                          <div className="flex w-full justify-between gap-2 sm:w-auto flex-row sm:items-center sm:shrink-0">
                            {hasPermission("Milestones", "Edit Records") && (
                              <CustomTooltip tooltipContent="Update Milestone">
                                <Button
                                  className="border-button"
                                  onClick={() => handleEdit(m)}
                                >
                                  <Edit2 size={16} className="" />
                                  {/* <span className="whitespace-nowrap">
                                    Edit
                                  </span> */}
                                </Button>
                              </CustomTooltip>
                            )}

                            {hasPermission("Milestones", "Delete Records") && (
                              <CustomTooltip tooltipContent="Delete Milestone">
                                <Button
                                  variant="outline"
                                  className="logout-button"
                                  onClick={() => handleDelete(m)}
                                >
                                  <Trash2 size={16} className="shrink-0" />
                                  {/* <span className="whitespace-nowrap">
                                    Delete
                                  </span> */}
                                </Button>
                              </CustomTooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!loading && (
                  <div className="mt-8 flex justify-between items-center">
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Showing {filteredMilestones.length} of{" "}
                      {paginationData.totalItems} milestones (Page {paginationData.page} of {paginationData.totalPages})
                    </p>
                    {paginationData.totalPages > 1 && (
                      <Pagination
                        total={paginationData.totalItems}
                        current={paginationData.page}
                        pageSize={paginationData.size}
                        lastPage={paginationData.lastPage}
                        onPageChange={pageChange}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Calendar Tab - Dynamic Fetch on Navigation */}
        <TabsContent value="calendar">
          <div className="h-[720px] rounded-2xl shadow-lg overflow-hidden border border-[var(--border)] bg-[var(--background)] relative">
            {calendarLoading && (
              <div className="absolute inset-0 bg-[var(--background)]/80 flex items-center justify-center z-10">
                <p className="text-lg">Loading milestones...</p>
              </div>
            )}
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              components={{ event: MilestoneEvents }}
              style={{ height: "100%", padding: 20, fontSize: 14 }}
              views={["month"]}
              defaultView={Views.MONTH}
              date={calendarDate}
              onNavigate={(newDate) => setCalendarDate(newDate)} // Triggers fetch on next/prev
              popup
              selectable
              onSelectEvent={(event) =>
                navigate(`/app/milestones/milestone-detail/${event.id}`)
              }
              dayPropGetter={(date) => {
                const today = new Date();
                const isToday = today.toDateString() === date.toDateString();
                const isPast =
                  date <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  );
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                const baseStyle = {
                  borderTop: "1px solid var(--border)",
                  borderLeft: "1px solid var(--border)",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  transition:
                    "background-color 140ms ease, box-shadow 140ms ease, color 140ms ease",
                };

                if (isToday)
                  return {
                    style: {
                      ...baseStyle,
                      background:
                        "radial-gradient(circle at 10% 0%, rgba(250,204,21,0.18), transparent 55%)",
                      boxShadow: "inset 0 0 0 1.5px var(--button)",
                    },
                  };
                if (isPast)
                  return {
                    style: {
                      ...baseStyle,
                      backgroundColor: "rgba(148,163,184,0.05)",
                      color: "var(--muted-foreground)",
                    },
                  };
                if (!isPast && isWeekend)
                  return {
                    style: {
                      ...baseStyle,
                      backgroundColor: "rgba(129,140,248,0.04)",
                    },
                  };
                return { style: baseStyle };
              }}
              eventPropGetter={() => ({
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0px",
                  margin: "0px",
                  borderRadius: "0px",
                  fontSize: "11px",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                  color: "var(--foreground)",
                  transition: "color 120ms ease, transform 80ms ease",
                },
              })}
            />
          </div>
        </TabsContent>
      </Tabs>
      {/* Dialogs */}
      <GlobalDialog
        open={showMilestoneDialog}
        onClose={() => setShowMilestoneDialog(false)}
        label={editMilestone ? "Update Milestone" : `Create Milestone${milestoneCount > 0 ? ` (${milestoneCount+1})` : ''}`}
      >
        <AddMilestoneDialog
          selectedProjectId={selectedProjectId}
          milestone={editMilestone}
          projects={inprogressProjects}
          onSuccess={onMilestoneSuccess}
          // dependencies={[]}
          onClose={() => setShowMilestoneDialog(false)}
          onMilestoneCountChange={setMilestoneCount}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        onConfirm={handleDeleteConfirm}
        name={selectedMilestone?.name || ""}
      />
    </div>
  );
}

export default Task;
