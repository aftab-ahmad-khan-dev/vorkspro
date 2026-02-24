import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Building2,
  CalendarDays,
  AlarmClock,
  AlertOctagon,
  Bell,
  UserRound,
  MessageSquare,
  Mail,
  Phone,
  Video,
  User2,
  ExternalLink,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog";
import Pagination from "@/components/UsePagination";
import StatCard from "@/components/Stats";
import { toast } from "sonner";
import LogDialog from "@/models/followup/LogDialog";
import ScheduleDialog from "@/models/followup/ScheduleDialog";
import Chip from "@/components/Chip";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { useTabs } from "@/context/TabsContext";
import { apiGet, apiGetByFilter, apiPatch } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

function FollowHub() {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "followup";
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}"); // Assuming user info is stored

  /* ────────────────────── STATE ────────────────────── */
  const [activeTab, setActiveTab] = useState("Schedule Follow-up");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("all"); 
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [allData, setAllData] = useState({}); // Raw data from API
  const [stats, setStats] = useState({});

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
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

  const tabsPermission = (moduleName, tabs) => {
    if (isSuperAdmin) return true;
    const module = actions?.modulePermissions?.find(
      (modules) => modules.module === moduleName
    );
    if (!module) return false;
    return module.tabs.some((action) => tabs.includes(action));
  };

  const allowedTabs = useMemo(() => {
    const tabs = [];

    if (tabsPermission("Follow-up-Hub", ["Schedule Follow-up"])) {
      tabs.push("Schedule Follow-up");
    }

    if (tabsPermission("Follow-up-Hub", ["Communication History"])) {
      tabs.push("Communication History");
    }

    if (tabsPermission("Follow-up-Hub", ["My Follow-ups"])) {
      tabs.push("My Follow-ups");
    }

    return tabs;
  }, [actions, isSuperAdmin]);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "");
    }
  }, [allowedTabs, activeTab]);

  function formatTime12h(time) {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /* ────────────────────── FETCH LOGIC ────────────────────── */
  const fetchClients = async () => {
    try {
      const data = await apiGet("client/get-active-client");
      if (data.isSuccess) setClients(data.filteredData?.clients || []);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await apiGet("employee/get-active-employees");
      if (data.isSuccess) setEmployees(data.filteredData?.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await apiGet(`followup/get-stats`);
      if (data.isSuccess) setStats(data.stats || {});
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const changeStatus = async (id) => {
    try {
      const data = await apiPatch(`followup/mark-complete/${id}`);
      if (data?.isSuccess) {
        toast.success("Follow-up marked as complete");
        fetchFollowupsAndLogs(pagination.page, searchTerm, activeTab);
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const fetchFollowupsAndLogs = async (
    page = 1,
    search = "",
    tab = activeTab
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        size: pagination.size,
      });
      if (search) params.append("search", search);

      // Map tab to type
      let type;
      if (tab === "Schedule Follow-up") type = "schedule-followup";
      else if (tab === "Communication History") type = "communication-history";
      else if (tab === "My Follow-ups") type = "my-followup";

      if (type) params.append("type", type);
      
      if (type === "schedule-followup" && assignedToFilter === "mine") {
        params.append("assignedTo", "mine");
      }
      
      const data = await apiGetByFilter(`followup/get-by-filter`, {
        page,
        size: pagination.size,
        search,
        type,
        ...(type === "schedule-followup" && assignedToFilter === "mine" && { assignedTo: "mine" })
      });

      if (data.isSuccess) {
        setAllData(data.filteredData || {});
        setPagination({
          page: data.pagination?.page || 1,
          size: data.pagination?.size || 10,
          totalItems: data.pagination?.totalItems || 0,
          totalPages: data.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────── EFFECTS ────────────────────── */
  useEffect(() => {
    fetchClients();
    fetchEmployees();
    fetchStats();
  }, []);

  // Combined effect for all follow-up fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFollowupsAndLogs(1, searchTerm, activeTab);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for tab changes
    
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, assignedToFilter]);

  const pageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchFollowupsAndLogs(newPage, searchTerm, activeTab);
    }
  };

  /* ────────────────────── DATA PER TAB ────────────────────── */
  // const currentData = useMemo(() => {
  //   if (activeTab === "Schedule Follow-up") return allData.followups || [];
  //   if (activeTab === "Communication History") return allData.followups || [];
  //   if (activeTab === "My Follow-ups")
  //     return (
  //       allData.followups?.filter(
  //         (f) => f.assignedTo?._id === currentUser._id
  //       ) || []
  //     );
  //   return [];
  // }, [allData, activeTab, currentUser._id]);
  const currentData = useMemo(() => {
    const followups = allData.followups || [];

    if (activeTab === "Schedule Follow-up") {
      return followups.filter(f => f.type === "schedule-followup");
    }

    if (activeTab === "Communication History") {
      return followups.filter(f => f.type === "communication-history");
    }

    if (activeTab === "My Follow-ups") {
      return followups.filter(f => f.type === "my-followup");
    }

    return [];
  }, [allData, activeTab]);


  const currentTotalItems = useMemo(() => {
    if (activeTab === "My Follow-ups") {
      return (
        allData.followups?.filter((f) => f.assignedTo?._id === currentUser._id)
          .length || 0
      );
    }
    return pagination.totalItems;
  }, [allData, activeTab, currentUser._id, pagination.totalItems]);

  /* ────────────────────── HELPER COMPONENTS ────────────────────── */
  const SkeletonRow = () => (
    <tr className="border-b border-[var(--border)] animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-[var(--border)] rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  const priorityBadge = (p) =>
    p === "High"
      ? "bg-red-500/20 text-red-500"
      : p === "Medium"
        ? "bg-blue-600/20 text-blue-500"
        : "bg-gray-600/20 text-[var(--card-foreground)]";

  const statusBadge = (s) =>
    s === "Due Today"
      ? "bg-amber-500/20 text-amber-800 dark:text-amber-500"
      : s === "Overdue"
        ? "bg-red-500/20 text-red-500"
        : s === "Completed"
          ? "bg-green-500/20 text-green-500"
          : "bg-blue-600/20 text-blue-500";

  const channelIcon = (c) => {
    switch (c) {
      case "Email":
        return <Mail size={18} className="text-blue-600" />;
      case "Phone Call":
        return <Phone size={18} className="text-green-600" />;
      case "Video Meeting":
        return <Video size={18} className="text-purple-600" />;
      case "WhatsApp":
        return <MessageSquare size={18} className="text-emerald-600" />;
      case "In-Person":
        return <User2 size={18} className="text-gray-700 dark:text-gray-400" />;
      default:
        return <MessageSquare size={18} className="text-gray-500" />;
    }
  };

  /* ────────────────────── RENDER TABLE ROW (Shared) ────────────────────── */
  const renderTableRow = (item) => {
    const isLog = activeTab === "Communication History";
    return (
      <tr
        key={item._id}
        className="border-b border-[var(--border)] hover:bg-[var(--border)]/30"
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-full bg-[var(--border)]">
              <Building2 size={16} />
            </div>
            <div>
              <p className="font-medium">{item.client?.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {item.contactPerson}
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm">
          {isLog ? item.notes || item.topic : item.topic}
        </td>
        <td className="px-6 py-4 text-sm">
          {isLog
            ? formatDate(item.date)
            : `${formatDate(item.date)} at ${formatTime12h(item.time)}`}
        </td>
        <td className="px-6 py-4">
          {isLog ? (
            <div className="flex items-center gap-2">
              {channelIcon(item.channel)}
              <span className="text-sm capitalize">{item.channel}</span>
            </div>
          ) : (
            <Chip status={item.priority} />
          )}
        </td>
        <td className="px-6 py-4">
          {isLog ? (
            <Chip status="Logged" className="bg-gray-500/20 text-gray-700" />
          ) : (
            <Chip status={item.status} />
          )}
        </td>
        <td className="px-6 py-4 space-x-2 text-right">
          {hasPermission("Follow-up-Hub", "Edit Records") && !isLog && item.status?.toLowerCase() !== "completed" && (
            <Button
              size="sm"
              className="ml-3"
              onClick={() => changeStatus(item._id)}
            >
              Complete
            </Button>
          )}
          {/* <Button
            size="sm"
            className="border-button"
            onClick={() => toast.info("View details coming soon")}
          >
            View
          </Button> */}
        </td>
      </tr>
    );
  };

  const renderMobileCard = (item) => {
    const isLog = activeTab === "Communication History";
    return (
      <div
        key={item._id}
        className="p-4 border-b border-[var(--border)] hover:bg-[var(--border)]/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center rounded-full bg-[var(--border)]">
            <Building2 size={18} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{item.client?.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {item.contactPerson}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-xs">
          <p className="text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">
              {isLog ? "Notes" : "Purpose"}:
            </span>{" "}
            {isLog ? item.notes || item.topic : item.topic}
          </p>
          <p className="text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Date:</span>{" "}
            {formatDate(item.date)} {!isLog && `at ${formatTime12h(item.time)}`}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--foreground)] text-xs">
              {isLog ? "Channel" : "Priority"}:
            </span>
            {isLog ? (
              <div className="flex items-center gap-2">
                {channelIcon(item.channel)}
                <span>{item.channel}</span>
              </div>
            ) : (
              <Chip status={item.priority} />
            )}
          </div>
          <div className="flex mt-3 md:mt-0 items-center gap-2">
            <span className="font-medium text-[var(--foreground)] text-xs">
              Status:
            </span>
            <Chip status={isLog ? "Logged" : item.status} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <Button
            size="sm"
            className="border-button w-full xs:w-auto"
            onClick={() => toast.info("View details coming soon")}
          >
            View
          </Button>
          {!isLog && item.status?.toLowerCase() !== "completed" && (
            <Button
              size="sm"
              className="w-full xs:w-auto"
              onClick={() => changeStatus(item._id)}
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    );
  };

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] truncate">
              Follow-up & Communication Hub
            </h1>
            <p className="mt-1 text-sm sm:text-base">
              Manage client relationships and track all communications
            </p>
          </div>

          <div className="w-full sm:w-auto min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {
                hasPermission("Follow-up-Hub", "Create Records") && (
                  <>
                    <Button
                      className="border-button w-full justify-center md:justify-start"
                      onClick={() => setOpenLogDialog(true)}
                    >
                      <MessageSquare className="mr-1 shrink-0" />
                      <span className="truncate">Log Communication</span>
                    </Button>

                    <Button
                      className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 w-full justify-center md:justify-start"
                      onClick={() => setOpenScheduleDialog(true)}
                    >
                      <Plus size={18} className="shrink-0" />
                      <span className="truncate text-sm">Schedule Follow-up</span>
                    </Button>
                  </>
                )
              }


            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Overdue"
          isLoading={statsLoading}
          value={stats.overDueFollowups}
          valueClass="text-red-500"
        />
        <StatCard
          title="Due Today"
          isLoading={statsLoading}
          value={stats.dueTodayFollowups}
          valueClass="text-orange-500"
        />
        <StatCard
          title="Upcoming"
          isLoading={statsLoading}
          value={stats.upcomingFollowups}
          valueClass="text-blue-500"
        />
        <StatCard
          title="Total Communications"
          isLoading={statsLoading}
          value={stats.totalFollowups}
        />
      </div>

      <div className="p-4 sm:p-6 border border-[var(--border)] rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative w-full lg:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <Input
              type="text"
              placeholder="Search on topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          {/* Filter for Schedule Follow-up only */}
          {activeTab === "Schedule Follow-up" && (
            <div className="w-full sm:w-auto">
              <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mine">Mine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {allowedTabs.length >= 2 && (
          <div className="hidden sm:flex bg-[var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
            <TabsList className="flex mb-4 sm:mb-6 rounded-2xl bg-[var(--foreground)]/10 overflow-x-auto no-scrollbar gap-1 px-1">
              {allowedTabs.includes("Schedule Follow-up") && (
                <TabsTrigger
                  value="Schedule Follow-up"
                  className="rounded-2xl py-2 px-3 sm:px-4 text-sm font-medium"
                >
                  Schedule Follow-up
                </TabsTrigger>
              )}
              {allowedTabs.includes("Communication History") && (
                <TabsTrigger
                  value="Communication History"
                  className="rounded-2xl py-2 px-3 sm:px-4 text-sm font-medium"
                >
                  Communication History
                </TabsTrigger>
              )}
              {/* {allowedTabs.includes("My Follow-ups") && (
                <TabsTrigger
                  value="My Follow-ups"
                  className="rounded-2xl py-2 px-3 sm:px-4 text-sm font-medium"
                >
                  My Follow-ups
                </TabsTrigger>
              )} */}
            </TabsList>
          </div>
        )}
        {allowedTabs.length >= 2 && (
          <div className="sm:hidden text-[var(--foreground)] mb-3">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedTabs.includes("Schedule Follow-up") && (
                  <SelectItem value="Schedule Follow-up">
                    Schedule Follow-up
                  </SelectItem>
                )}
                {allowedTabs.includes("Communication History") && (
                  <SelectItem value="Communication History">
                    Communication History
                  </SelectItem>
                )}
                {allowedTabs.includes("My Follow-ups") && (
                  <SelectItem value="My Follow-ups">My Follow-ups</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        <TabsContent value={activeTab}>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--background)] shadow-md">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)]/50">
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      {activeTab === "Communication History"
                        ? "Notes"
                        : "Purpose"}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      {activeTab === "Communication History"
                        ? "Channel"
                        : "Priority"}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-[var(--muted-foreground)]"
                      >
                        {/* No data found. */}
                        <EmptyState icon={MessageSquare} title="No followups found" subtitle="Add followups to get started"></EmptyState>
                      </td>
                    </tr>
                  ) : (
                    currentData.map(renderTableRow)
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border-b border-[var(--border)] animate-pulse space-y-2"
                  >
                    <div className="h-4 w-1/2 bg-[var(--border)] rounded" />
                    <div className="h-3 w-2/3 bg-[var(--border)] rounded" />
                    <div className="h-3 w-1/3 bg-[var(--border)] rounded" />
                  </div>
                ))
              ) : currentData.length === 0 ? (
                <div className="py-8 text-center text-[var(--muted-foreground)]">
                  No data found.
                </div>
              ) : (
                currentData.map(renderMobileCard)
              )}
            </div>
          </div>
        </TabsContent>

        {/* Pagination */}
        {currentTotalItems > 0 && !loading && (
          <div className="mt-6 flex justify-between items-center text-sm text-[var(--muted-foreground)]">
            <p>
              Showing {currentData.length} of {currentTotalItems} items
            </p>
            <Pagination
              total={currentTotalItems}
              current={pagination.page}
              pageSize={pagination.size}
              lastPage={pagination.totalPages}
              onPageChange={pageChange}
            />
          </div>
        )}
      </Tabs>

      {/* Dialogs */}
      <GlobalDialog
        open={openLogDialog}
        onClose={() => setOpenLogDialog(false)}
        label="Log Communication"
      >
        <LogDialog
          clients={clients}
          onSuccess={() => {
            setOpenLogDialog(false);
            fetchFollowupsAndLogs(pagination.page, searchTerm, activeTab);
            fetchStats();
          }}
        />
      </GlobalDialog>

      <GlobalDialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
        label="Schedule Follow-up"
      >
        <ScheduleDialog
          clients={clients}
          allEmployees={employees}
          onSuccess={() => {
            setOpenScheduleDialog(false);
            fetchFollowupsAndLogs(pagination.page, searchTerm, activeTab);
            fetchStats();
          }}
        />
      </GlobalDialog>
    </div>
  );
}

export default FollowHub;
