import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  EllipsisVertical,
  Briefcase,
  Plus,
  Search,
  Download,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Calendar,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  CircleCheckBig,
  User,
  Edit2,
  Trash,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GlobalDialog from "@/models/GlobalDialog";
import CreateDialog from "@/models/project/CreateDialog";
import Pagination from "@/components/UsePagination";
import StatCard from "@/components/Stats";
import { toast } from "sonner";
import ProfilePicture from "@/components/ProfilePicture";
import SearchableSelect from "@/components/SearchableSelect";
import { useNavigate } from "react-router-dom";
import Confirmation from "@/models/Confirmation";
import Chip from "@/components/Chip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTabs } from "@/context/TabsContext";
import CustomTooltip from "@/components/Tooltip";
import { apiGet, apiGetByFilter, apiDelete, apiPatch } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";
import { ViewToggle, KanbanBoard, CalendarWrapper, ListGridToggle } from "@/components/views";

function Project() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Projects");
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin || false;

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

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list | calendar | kanban
  const [listLayout, setListLayout] = useState("grid"); // list (table) | grid (cards)

  // FILTER STATES
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedManager, setSelectedManager] = useState("all");

  // ── TAB MAPPING ─────────────────────────────────────
  const tabKeys = {
    "All Projects": "totalProjects",
    "In Progress": "inProgressProjects",
    "On Hold": "onHoldProjects",
    Completed: "completedProjects",
    Cancelled: "cancelledProjects",
  };

  const statusMap = {
    "In Progress": "in progress",
    "On Hold": "on hold",
    Completed: "completed",
    Cancelled: "cancelled",
  };

  const PROJECT_KANBAN_COLUMNS = [
    { id: "not started", title: "Not Started" },
    { id: "in progress", title: "In Progress" },
    { id: "on hold", title: "On Hold" },
    { id: "completed", title: "Completed" },
    { id: "cancelled", title: "Cancelled" },
  ];

  const projectCalendarEvents = useMemo(() => {
    return (projects || [])
      .filter((p) => p.startDate || p.endDate)
      .map((p) => ({
        id: p._id,
        title: p.name,
        start: p.startDate ? new Date(p.startDate) : new Date(p.endDate || p.createdAt),
        end: p.endDate ? new Date(p.endDate) : new Date(p.startDate || p.createdAt),
        resource: p,
      }));
  }, [projects]);

  const handleProjectStatusMove = async (projectId, _from, toColumnId) => {
    const newStatus = toColumnId;
    const prev = projects;
    setProjects((p) =>
      p.map((proj) => (proj._id === projectId ? { ...proj, status: newStatus } : proj))
    );
    try {
      const data = await apiPatch(`project/change-status/${projectId}`, { status: newStatus });
      if (data?.isSuccess) {
        fetchStats();
        toast.success("Project status updated");
      } else {
        setProjects(prev);
        toast.error(data?.message || "Failed to update");
      }
    } catch (err) {
      setProjects(prev);
      toast.error("Failed to update project status");
    }
  };

  // ── HELPER: Calculate Days Left ───────────────────────
  const getDaysLeft = (endDate) => {
    if (!endDate) return "N/A";
    const diff = new Date(endDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(x - startX) > 5) setDragMoved(true);
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  // ── HELPER: Task Stats ────────────────────────────────
  const getTaskStats = (tasks = []) => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const active = tasks.filter(
      (t) => !t.completed && t.status !== "pending"
    ).length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    return { total, done, active, pending };
  };

  // ── FETCH PROJECTS ─────────────────────────────────────
  const fetchProjects = async (
    page = 1,
    search = "",
    status = "",
    teamMembers = [],
    client = "",
    projectManager = ""
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        size: pagination.size,
        sort: "createdAt",
        order: "desc",
      });
      if (search) params.append("search", search);
      if (status && status !== "All Projects") {
        params.append("status", statusMap[status]);
      }
      if (teamMembers.length > 0) {
        teamMembers.forEach((id) => params.append("teamMembers", id));
      }
      if (client) params.append("client", client);
      if (projectManager) params.append("projectManager", projectManager);

      const data = await apiGetByFilter("project/get-by-filter", params);

      if (data?.isSuccess) {
        const fd = data.filteredData;
        const projectsList = Array.isArray(fd) ? fd : (fd?.projects ?? []);
        const pag = fd?.pagination;
        setProjects(projectsList);
        setPagination({
          page: pag?.page ?? 1,
          size: pag?.size ?? pagination.size,
          totalItems: pag?.totalItems ?? 0,
          totalPages: pag?.totalPages ?? 1,
          lastPage: pag?.lastPage ?? 1,
        });
      }
    } catch (err) {
      console.error(err);
      setProjects([]);
      const m = err?.message || "";
      const isNetwork = /failed to fetch|networkerror|load failed/i.test(m);
      const msg = isNetwork
        ? "Unable to connect to the server. Please check your connection and that the API is running."
        : m.toLowerCase().includes("permission")
          ? "You don't have permission to view projects."
          : "Failed to load projects.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`project/delete/${selectedProject}`);
      toast.success("Project deleted successfully");
      setOpenConfirmation(false);
      await fetchProjects(pagination.page, searchTerm, activeTab, [], "", "");
      await fetchStats();
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  // ── FETCH CLIENTS & EMPLOYEES ───────────────────────────
  const fetchClients = async () => {
    try {
      const data = await apiGet("client/get-active-client");
      if (data?.isSuccess) setClients(data.filteredData?.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await apiGet("employee/get-active-employees");
      if (data?.isSuccess) setEmployees(data.filteredData?.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ── FETCH STATS ───────────────────────────────────────
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await apiGet("project/get-stats");
      if (data?.isSuccess) setStats(data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ── EFFECTS ───────────────────────────────────────────
  useEffect(() => {
    fetchClients();
    fetchEmployees();
    fetchStats();
  }, []);

  // Combined effect for all project fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(
        1,
        searchTerm,
        activeTab,
        selectedTeamMembers,
        selectedClient,
        selectedManager
      );
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for other changes

    return () => clearTimeout(timer);
  }, [
    activeTab,
    searchTerm,
    selectedTeamMembers,
    selectedClient,
    selectedManager,
  ]);

  // ── PAGINATION ───────────────────────────────────────
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      fetchProjects(
        newPage,
        searchTerm,
        activeTab,
        selectedTeamMembers,
        selectedClient,
        selectedManager
      );
    }
  };

  // ── CLEAR FILTERS ─────────────────────────────────────
  const clearFilters = () => {
    if (
      selectedTeamMembers.length > 0 ||
      selectedClient !== "all" ||
      selectedManager !== "all"
    ) {
      setSelectedTeamMembers([]);
      setSelectedClient("all");
      setSelectedManager("all");
      fetchProjects(1, searchTerm, activeTab, [], "all", "all");
    }
  };

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8 flex flex-col gap-8">
      {/* Header */}
      <div className="mb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Title + Subtitle */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Projects
            </h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Manage projects, tasks, and team assignments
            </p>
          </div>

          {/* Right: Button */}
          {hasPermission("Projects", 'Create Records') && (
            <Button
              onClick={() => {
                setSelectedProject(null);
                setShowCreateDialog(true);
              }}
              className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto justify-center flex items-center gap-2"
            >
              <Plus size={18} /> New Project
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${actions.cost ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6`}>
        <StatCard
          title="Total Projects"
          value={stats.totalProjects ?? 0}
          subtitle={
            stats.projectsCreatedThisMonth != null
              ? `${stats.projectsCreatedThisMonth > 0 ? "+" : ""}${stats.projectsCreatedThisMonth} this month`
              : undefined
          }
          icon={<Briefcase size={20} className="text-[var(--primary)]" />}
          isLoading={statsLoading}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressProjects ?? 0}
          subtitle="Active development"
          valueClass="text-blue-600"
          icon={<Clock size={20} className="text-blue-500" />}
          isLoading={statsLoading}
        />
        <StatCard
          title="Completed"
          value={stats.completedProjects ?? 0}
          subtitle="Successfully delivered"
          valueClass="text-green-600"
          icon={<CheckCircle2 size={20} className="text-green-500" />}
          isLoading={statsLoading}
        />
        {actions.cost && (
          <StatCard
            title="Total Cost"
            value={
              stats?.totalCost != null
                ? typeof stats.totalCost === "number"
                  ? stats.totalCost.toLocaleString()
                  : stats.totalCost
                : "—"
            }
            subtitle="Across all projects"
            icon={<DollarSign size={20} className="text-[var(--primary)]" />}
            isLoading={statsLoading}
          />
        )}
      </div>

      {/* Tabs + Search + Filters */}
      <div className="p-6 border border-[var(--border)] rounded-lg mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Desktop Tabs */}
          <div className="hidden 2xl:block">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex gap-2 rounded-2xl bg-[var(--foreground)]/10 p-1 overflow-x-auto">
                {Object.keys(tabKeys).map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-2xl px-4 py-2 text-sm font-medium whitespace-nowrap"
                  >
                    {tab} ({stats[tabKeys[tab]] ?? "-"})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Mobile Dropdown */}
          <div className="2xl:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(tabKeys).map((tab) => (
                  <SelectItem key={tab} value={tab}>
                    {tab} ({stats[tabKeys[tab]] ?? "-"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search + Filter + Export */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end w-full">
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto border-button bg-transparent ${showFilters
                ? "text-[var(--button)] border border-[var(--button)]"
                : ""
                }`}
            >
              <Filter size={18} className="mr-2" />
              Filter{" "}
              {showFilters ? (
                <ChevronUp size={18} className="ml-2" />
              ) : (
                <ChevronDown size={18} className="ml-2" />
              )}
            </Button>

            {hasPermission("Projects", 'Export Data') && (
              <Button className="border-button" disabled={loading}>
                <Download size={18} className="mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-wrap gap-4">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Team Members</label>
              <SearchableSelect
                placeholder="Select team members"
                items={employees}
                value={selectedTeamMembers}
                onValueChange={setSelectedTeamMembers}
                multi={true}
              />
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium">Project Manager</label>
              <Select
                value={selectedManager}
                onValueChange={setSelectedManager}
              >
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder="All Managers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Managers</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500/20"
                disabled={
                  selectedTeamMembers.length === 0 &&
                  selectedClient === "all" &&
                  selectedManager === "all"
                }
              >
                <X size={16} className="mr-1" /> Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Toggle: List | Calendar | Kanban + List/Grid when in list */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle
            value={viewMode}
            onValueChange={setViewMode}
            enabledViews={["list", "calendar", "kanban"]}
            listLabel="List"
          />
          {viewMode === "list" && (
            <div className="flex items-center border-l border-[var(--border)] pl-3 ml-0 sm:ml-0">
              <ListGridToggle value={listLayout} onValueChange={setListLayout} />
            </div>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="mb-8 p-1">
          <CalendarWrapper
            events={projectCalendarEvents}
            style={{ height: 540 }}
            onSelectEvent={(event) => event?.resource?._id && navigate(`/app/projects/project-detail/${event.resource._id}`)}
          />
        </div>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] h-[320px] animate-pulse bg-[var(--muted)]/30" />
              ))}
            </div>
          ) : (
            <KanbanBoard
              columns={PROJECT_KANBAN_COLUMNS}
              items={projects}
              getColumnId={(p) => p.status || "not started"}
              getItemId={(p) => p._id}
              onMove={handleProjectStatusMove}
              renderCard={(p) => (
                <div onClick={() => hasPermission("Projects", "View Records") && navigate(`/app/projects/project-detail/${p._id}`)}>
                  <h4 className="font-semibold text-sm truncate">{p.name}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 truncate">{p.client?.name || "No client"}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{p.progress?.toFixed(0) ?? 0}% progress</p>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* List View - Table or Grid */}
      {viewMode === "list" && (
        listLayout === "list" ? (
          <div
            className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)] mb-8"
            id="driver-main-content"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                      Project
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                      Client
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                      Progress
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                      Days Left
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr
                        key={i}
                        className="border-b border-[var(--border)] animate-pulse"
                      >
                        <td className="px-4 py-3">
                          <div className="h-4 w-32 bg-[var(--border)] rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-24 bg-[var(--border)] rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-6 w-20 bg-[var(--border)] rounded-full" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-12 mx-auto bg-[var(--border)] rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-12 mx-auto bg-[var(--border)] rounded" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-8 w-24 ml-auto bg-[var(--border)] rounded" />
                        </td>
                      </tr>
                    ))
                  ) : projects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center"
                      >
                        <EmptyState
                          icon={Briefcase}
                          title="No projects found"
                          subtitle="Try adjusting search or create your first project"
                        />
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr
                        key={project._id}
                        onClick={() =>
                          hasPermission("Projects", "View Records") &&
                          navigate(`/app/projects/project-detail/${project._id}`)
                        }
                        className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[var(--foreground)]">
                            {project.name}
                          </div>
                          {project.priority && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {project.priority} priority
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[var(--foreground)]">
                          {project.client?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Chip status={project?.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-12 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--primary)] rounded-full"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {project.progress?.toFixed(0) ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">
                          {getDaysLeft(project.endDate)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              hasPermission("Projects", "View Records") &&
                                navigate(
                                  `/app/projects/project-detail/${project._id}`
                                );
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            id="driver-main-content"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="relative rounded-xl border border-[var(--border)] max-w-full overflow-hidden animate-pulse"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
                    <div className="flex justify-between min-w-0 bg-[var(--border)]/20 rounded-md flex-1 p-3 sm:p-4 rounded-b-none">
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="h-4 sm:h-5 w-40 sm:w-56 bg-[var(--border)]/60 rounded mb-2" />
                        <div className="h-3 sm:h-4 w-28 sm:w-40 bg-[var(--border)]/50 rounded" />
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="h-6 w-16 bg-[var(--border)]/60 rounded-full" />
                        <div className="h-6 w-16 bg-[var(--border)]/60 rounded-full" />
                      </div>
                    </div>

                    {/* Status + Priority */}
                  </div>

                  {/* Stats Grid */}
                  <div className="mx-3 grid grid-cols-3 bg-[var(--border)]/50 rounded-lg text-[10px] sm:text-xs p-2 sm:p-4 my-3 sm:my-4">
                    <div className="border-r border-[var(--muted-foreground)]/20 px-1">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-14 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-5 sm:h-6 w-16 sm:w-20 mx-auto bg-[var(--border)]/70 rounded" />
                    </div>

                    <div className="border-r border-[var(--muted-foreground)]/20 px-1">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-12 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-5 sm:h-6 w-16 sm:w-20 mx-auto bg-[var(--border)]/70 rounded" />
                    </div>

                    <div className="px-1">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-14 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-5 sm:h-6 w-16 sm:w-20 mx-auto bg-[var(--border)]/70 rounded" />
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="mx-3 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3 relative">
                    <div className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-[var(--border)] -translate-x-1/2" />

                    <div className="grid grid-cols-2 gap-1 pr-2 sm:pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-12 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-4 w-24 justify-self-end bg-[var(--border)]/70 rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-1 pl-2 sm:pl-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-14 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-4 w-28 justify-self-end bg-[var(--border)]/70 rounded" />
                    </div>

                    <div className="grid grid-cols-2 items-center pr-2 sm:pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-24 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-4 w-10 justify-self-end bg-[var(--border)]/70 rounded" />
                    </div>

                    <div className="grid grid-cols-2 pl-2 sm:pl-3 items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-[var(--border)]/70" />
                        <div className="h-3 w-16 bg-[var(--border)]/60 rounded" />
                      </div>
                      <div className="h-4 w-28 justify-self-end bg-[var(--border)]/70 rounded" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-[var(--border)]/20 rounded-lg p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between select-none">
                    <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 w-8 rounded-full bg-[var(--border)]/70 border-2 border-[var(--background)] ${i !== 0 ? "-ml-3" : ""
                            }`}
                        />
                      ))}
                      <div className="h-4 w-16 bg-[var(--border)]/60 rounded ml-2" />
                    </div>

                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-stretch sm:justify-end w-full sm:w-auto">
                      <div className="sm:flex-1 flex sm:justify-center">
                        <div className="h-6 w-28 bg-[var(--border)]/60 rounded-full" />
                      </div>

                      <div className="h-9 w-full sm:w-28 bg-[var(--border)]/70 rounded-md" />
                      <div className="h-9 w-10 bg-[var(--border)]/70 rounded-md" />
                      <div className="h-9 w-10 bg-[var(--border)]/70 rounded-md" />
                    </div>
                  </div>
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-2">
                <EmptyState
                  icon={Briefcase}
                  title="No projects found"
                  subtitle="Try adjusting your search or filters, or create your first project"
                />
              </div>
            ) : (
              projects.map((project) => {
                const daysLeft = getDaysLeft(project.endDate);
                const taskStats = getTaskStats(project.tasks);
                const budgetUsed =
                  project.cost > 0 ? (project.spent || 0) / project.cost : 0;
                const budgetPercent = Math.round(budgetUsed * 100);

                return (
                  <div
                    key={project._id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      hasPermission("Projects", "View Records") &&
                      navigate(`/app/projects/project-detail/${project._id}`)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        hasPermission("Projects", "View Records") &&
                          navigate(`/app/projects/project-detail/${project._id}`);
                      }
                    }}
                    className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 hover:shadow-xl transition-all duration-300 max-w-full overflow-hidden cursor-pointer"
                  >
                    {/* Subtle background glow */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-gradient-to-br from-[var(--button)]/60 via-transparent to-[var(--button)]/20" />

                    <div className="relative">
                      {/* Header */}
                      <div className="px-4 pt-4 sm:px-5 sm:pt-5 pb-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          {/* Name + Client */}
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] truncate">
                              {project.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] truncate">
                              {project.client?.name || "No client"}
                            </p>
                          </div>

                          {/* Status + Priority */}
                          <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
                            <Chip status={project?.status} />
                            {project.priority && <Chip status={project?.priority} />}
                          </div>
                        </div>
                      </div>

                      {/* Central stats panel */}
                      <div className="mx-4 sm:mx-5 my-3 sm:my-4 rounded-xl bg-[var(--border)]/40 px-3 sm:px-5 py-3 sm:py-4 grid grid-cols-2 gap-4 text-[11px] sm:text-xs">
                        {/* Progress */}
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-1.5 mb-1 text-[var(--muted-foreground)]">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Progress</span>
                          </div>
                          <p className="text-lg sm:text-2xl font-semibold text-[var(--foreground)]">
                            {project.progress.toFixed(2) || 0}%
                          </p>
                        </div>

                        {/* Days left */}
                        <div className="flex flex-col items-start sm:items-end">
                          <div className="flex items-center gap-1.5 mb-1 text-[var(--muted-foreground)]">
                            <Clock size={12} className="text-orange-500" />
                            <span>Days left</span>
                          </div>
                          <p className="text-lg sm:text-2xl font-semibold text-[var(--foreground)]">
                            {daysLeft}
                          </p>
                        </div>
                      </div>

                      {/* Info + budget + manager */}
                      <div className="mx-4 sm:mx-5 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3 relative">
                        {/* Middle vertical divider */}
                        <div className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-[var(--border)] -translate-x-1/2" />

                        {/* Deadline */}
                        <div className="grid grid-cols-2 gap-1 pr-2 sm:pr-3">
                          <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
                            <Calendar
                              size={12}
                              className="text-[var(--muted-foreground)]"
                            />
                            Deadline:
                          </span>
                          <span className="font-medium text-right truncate">
                            {project.endDate
                              ? new Date(project.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                              : "N/A"}
                          </span>
                        </div>

                        {/* Team Members */}
                        <div className="grid grid-cols-2 items-center pl-2 sm:pl-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Users
                              size={12}
                              className="text-[var(--muted-foreground)]"
                            />
                            <span className="text-[var(--muted-foreground)] truncate">
                              Team Members:
                            </span>
                          </div>
                          <div className="flex justify-end items-center">
                            <span>{project.teamMembers?.length}</span>
                          </div>
                        </div>

                        {/* Budget (optional, when cost is enabled) */}
                        {actions.cost && (
                          <div className="grid grid-cols-2 gap-1 pr-2 sm:pr-3">
                            <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
                              <DollarSign
                                size={12}
                                className="text-[var(--muted-foreground)]"
                              />
                              Cost:
                            </span>
                            <span className="font-medium text-right">
                              ${project.cost?.toLocaleString() || 0}
                            </span>
                          </div>
                        )}

                        {/* Project Manager */}
                        <div className="grid grid-cols-2 pl-2 sm:pl-3 items-center">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <User
                              size={12}
                              className="text-[var(--muted-foreground)]"
                            />
                            <span className="text-[var(--muted-foreground)] truncate">
                              Manager:
                            </span>
                          </div>
                          <span className="text-right font-medium truncate">
                            {project?.projectManager?.firstName}
                          </span>
                        </div>
                      </div>

                      {/* Footer with avatars + actions */}
                      <div className="bg-[var(--border)]/20 rounded-b-lg p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between select-none">
                        {/* LEFT - Team Avatars */}
                        <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible flex-shrink-0">
                          {project?.teamMembers?.slice(0, 5).map((member, index) => (
                            <Tooltip key={member._id}>
                              <TooltipTrigger asChild>
                                <div>
                                  <ProfilePicture
                                    name={member.firstName}
                                    size={32}
                                    className={`${index !== 0 ? "-ml-3" : ""
                                      } z-10 border-2 border-[var(--background)]`}
                                  />
                                </div>
                              </TooltipTrigger>

                              <TooltipContent className="text-sm font-medium">
                                {member.firstName} {member.lastName}
                              </TooltipContent>
                            </Tooltip>
                          ))}

                          {/* +N avatar */}
                          {project?.teamMembers?.length > 5 && (
                            <div className="text-xs sm:text-sm text-[var(--muted-foreground)] ml-2 whitespace-nowrap">
                              ({project.teamMembers.length - 5}) more
                            </div>
                          )}
                        </div>

                        {/* RIGHT - Buttons */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-stretch sm:justify-end w-full sm:w-auto">
                          <div className="sm:flex-1 flex sm:justify-center">
                            {project?.credentials?.filter(
                              (credit) => !credit?.keyValue || credit?.keyValue === ""
                            )?.length > 0 && (
                                <Chip
                                  className="bg-red-500/10 text-red-500 text-xs sm:text-sm"
                                  status={
                                    project?.credentials?.filter(
                                      (credit) =>
                                        !credit?.keyValue || credit?.keyValue === ""
                                    )?.length + " Missing key"
                                  }
                                />
                              )}
                          </div>

                          {hasPermission("Projects", 'View Records') && (
                            <Button
                              className="flex-1 border-button sm:flex-none "
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/projects/project-detail/${project._id}`);
                              }}
                            >
                              View detail
                            </Button>
                          )}

                          {hasPermission("Projects", 'Edit Records') && (
                            <CustomTooltip tooltipContent="Update Project">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCreateDialog(true);
                                  setSelectedProject(project);
                                }}
                                className="border-button w-10"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </CustomTooltip>
                          )}

                          {hasPermission("Projects", 'Delete Records') && (
                            <CustomTooltip tooltipContent="Delete Project">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenConfirmation(true);
                                  setSelectedProject(project?._id);
                                }}
                                className="logout-button w-10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </CustomTooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )
      )}

      {/* Pagination (list view only) */}
      {viewMode === "list" && projects.length > 0 && !loading && (
        <div className="flex justify-between items-center text-sm text-[var(--muted-foreground)] pb-5">
          <p>
            Showing {projects.length} of {pagination.totalItems} projects
          </p>
          <Pagination
            total={pagination.totalItems}
            current={pagination.page}
            pageSize={pagination.size}
            lastPage={pagination.lastPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Dialogs */}
      <GlobalDialog
        open={showCreateDialog}
        label={selectedProject ? "Edit Project" : "Create Project"}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedProject(null);
        }}
      >
        <CreateDialog
          clients={clients}
          employees={employees}
          selectedProject={selectedProject}
          onSuccess={() => {
            setShowCreateDialog(false);
            setSelectedProject(null);
            fetchProjects(
              pagination.page,
              searchTerm,
              activeTab,
              selectedTeamMembers,
              selectedClient,
              selectedManager
            );
            fetchStats();
          }}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        onConfirm={handleDelete}
      />
    </div >
  );
}

export default Project;
