import React, { useEffect, useState } from "react";
import {
  Check,
  Eye,
  Plus,
  X,
  PartyPopper,
  Cake,
  Award,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlobalDialog from "@/models/GlobalDialog";
import CreateDialog from "@/models/hr/CreateDialog";
import Confirmation from "@/models/Confirmation";
import Pagination from "@/components/UsePagination";
import { toast } from "sonner";
import StatCard from "@/components/Stats";
import HolidayDialog from "@/models/hr/HolidayDialog";
import Chip from "@/components/Chip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomTooltip from "@/components/Tooltip";
import { useTabs } from "@/context/TabsContext";
import { apiDelete, apiGet, apiGetByFilter, apiPatch } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

function HRManagement() {
  const [upcomingCelebrations, setUpcomingCelebrations] = useState([]);
  const [activeTab, setActiveTab] = useState("leave-management");
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showHolidayDialog, setShowHolidayDialog] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const { actions } = useTabs()
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

  const allowedTabs = React.useMemo(() => {
    const tabs = [];

    if (tabsPermission("HR Management", ["Leave Requests"])) {
      tabs.push("leave-management");
    }

    if (tabsPermission("HR Management", ["Holidays"])) {
      tabs.push("holidays");
    }

    return tabs;
  }, [actions, isSuperAdmin]);

  React.useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "");
    }
  }, [allowedTabs, activeTab]);

  const [hrStats, setHrStats] = useState({
    totalRequests: "-",
    pendingRequests: "-",
    onLeaveRequests: "-",
    upcomingHolidaysRequests: "-",
    upcomingEventsRequests: "-",
  });

  const holidays = [
    { date: "2025-10-25", name: "National Day", type: "Public" },
    { date: "2025-11-01", name: "Labor Day", type: "Public" },
    { date: "2025-12-25", name: "Christmas", type: "Public" },
  ];

  const policies = [
    {
      id: "p1",
      title: "Leave Policy",
      version: "v1.2",
      lastUpdated: "2025-09-15",
    },
    {
      id: "p2",
      title: "Remote Work Policy",
      version: "v1.0",
      lastUpdated: "2025-08-20",
    },
    {
      id: "p3",
      title: "Code of Conduct",
      version: "v2.1",
      lastUpdated: "2025-07-10",
    },
  ];

  const events = [
    { name: "Mike Chen", event: "Birthday", date: "2025-11-10", days: "5" },
    {
      name: "Lisa Abderson",
      event: "Birthday",
      date: "2025-11-10",
      days: "13",
    },
    {
      name: "Sara Johnson",
      event: "Work Anniversary",
      date: "2025-11-10",
      days: "26",
      years: "2",
    },
    {
      name: "John Davis",
      event: "Work Anniversary",
      date: "2025-11-10",
      days: "21",
      years: "3",
    },
  ];

  const daysUntil = (isoDate) => {
    const today = new Date();
    const target = new Date(isoDate);
    const ms = target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    setSelectedRequests([]);
    setShowDeleteButton(false);
  }, [activeTab]);

  const EventCard = ({ icon, iconBg, iconColor, name, subtitle, date }) => (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-full ${iconBg}`}
        >
          <span className={iconColor} aria-hidden>
            {icon}
          </span>
        </div>
        <div>
          <p className="text-sm text-[var(--foreground)]">{name}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{date}</p>
        <span className="mt-1 inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--border)] px-2 py-0.5 text-xs text-[var(--foreground)]">
          {daysUntil(date)} days
        </span>
      </div>
    </div>
  );

  async function fetchEmployees() {
    try {
      const data = await apiGet("employee/get-active-employees");
      if (data.isSuccess) setEmployees(data.filteredData?.employees || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function getUpComingCelebrations() {
    try {
      const data = await apiGet("leave-request/get-upcoming-celebration");

      if (data?.isSuccess) {
        setUpcomingCelebrations(data?.celebrations);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchLeaveTypes() {
    try {
      const data = await apiGet("leave-type/get-active-list");
      if (data?.isSuccess) setLeaveTypes(data?.filteredData.leaveType || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchHRStats() {
    setStatsLoading(true);
    try {
      const data = await apiGet("leave-request/get-stats");
      if (data.isSuccess) setHrStats(data.stats || {});
    } catch (error) {
      console.log(error);
    } finally {
      setStatsLoading(false);
    }
  }

  async function onApprove() {
    try {
      const data = await apiPatch(`leave-request/change-approval/${selectedRequest}`, { status: "approved" });
      if (data?.isSuccess) {
        toast.success(data.message);
        setOpenApproveDialog(false);
        setSelectedRequest(null);
        fetchLeaveRequests(paginationData.page, searchTerm);
        fetchHRStats();
      }
    } catch (error) {
      toast.error(error?.message);
    }
  }

  async function onReject() {
    try {
      const data = await apiPatch(`leave-request/change-approval/${selectedRequest}`, { status: "rejected" });
      if (data?.isSuccess) {
        toast.success(data.message);
        setOpenRejectDialog(false);
        setSelectedRequest(null);
        fetchLeaveRequests(paginationData.page, searchTerm);
        fetchHRStats();
      }
    } catch (error) {
      toast.error(error?.message);
    }
  }

  async function fetchLeaveRequests(page = 1, search = "", tab = activeTab) {
    setLoading(true);
    try {
      const data = await apiGetByFilter("leave-request/get-by-filter", {
        page,
        size: paginationData.size,
        sort: "createdAt",
        order: "desc",
        status: tab === "holidays" ? "holidaysRequest" : "leaveRequest",
        search,
      });
      if (data?.isSuccess) {
        setLeaveRequests(data.filteredData?.requests || []);
        setPaginationData({
          page: data.filteredData?.pagination?.page || 1,
          size: data.filteredData?.pagination?.size || 10,
          totalItems: data.filteredData?.pagination?.totalItems || 0,
          totalPages: data.filteredData?.pagination?.totalPages || 1,
          lastPage: data.filteredData?.pagination?.lastPage || 1,
        });
      } else {
        toast.error(data?.message || "Failed to fetch requests");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
    fetchLeaveTypes();
    fetchHRStats();
    setSelectedRequests([]);
    getUpComingCelebrations();
  }, []);

  const handleBulkDelete = async () => {
    try {
      const data = await apiDelete("leave-request/bulk-delete", { ids: selectedRequests });
      if (data.isSuccess) {
        toast.success("Deleted successfully");
        setOpenDeleteDialog(false);

        fetchLeaveRequests();
        setSelectedRequests([]);
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  // Combined effect for all leave request fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaveRequests(1, searchTerm, activeTab);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for tab changes
    
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.lastPage) {
      fetchLeaveRequests(newPage, searchTerm, activeTab);
    }
  };

  // const birthdays = events.filter((e) => e.event === "Birthday");
  // const anniversaries = events.filter((e) => e.event === "Work Anniversary");

  // const SkeletonRow = () => (
  //   <tr className="border-b border-[var(--border)] animate-pulse">
  //     {[1, 2, 3, 4, 5, 6].map((i) => (
  //       <td key={i} className="px-6 py-4">
  //         <div className="h-4 bg-[var(--border)] rounded w-full"></div>
  //       </td>
  //     ))}
  //   </tr>
  // );

  const mergedCelebrations = [...upcomingCelebrations].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );


  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
            HR Management
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-1">
            Manage leave requests, holidays, and HR policies
          </p>
        </div>
        {hasPermission("HR Management", "Create Records") && (
          <div className="flex justify-center sm:justify-end w-full sm:w-auto">
            <Button
              onClick={() => setShowRequestDialog(true)}
              className="bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus size={18} />
              <span className="text-sm">New Request</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Leave Requests"
          value={hrStats?.totalRequests}
          isLoading={statsLoading}
        />
        <StatCard
          title="Pending Approval"
          value={hrStats?.pendingRequests}
          isLoading={statsLoading}
        />
        <StatCard
          title="On leave today"
          value={hrStats?.onLeaveRequests}
          isLoading={statsLoading}
        />
        <StatCard
          title="Upcoming Holidays"
          value={hrStats?.holidaysRequests}
          isLoading={statsLoading}
        />
        <StatCard
          title="Upcoming Events"
          value={hrStats?.eventsRequests}
          isLoading={statsLoading}
        />
      </div>

      <div className="border border-purple-500/20 p-5 mb-5 rounded-lg">
        <h1 className="flex gap-2 text-[var(--foreground)]">
          <PartyPopper className="text-purple-600" size={20} />
          Upcoming Celebrations
        </h1>

        <p className="text-gray-500 mt-1">
          Employee birthdays and work anniversaries
        </p>

        {mergedCelebrations.length === 0 && !loading && (
          <p className="text-center my-5 text-gray-500">
            No upcoming celebrations
          </p>
        )}

        <div className="mt-5 grid md:grid-cols-2 gap-4 items-start">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] animate-pulse"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--border)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-[var(--border)] rounded" />
                    <div className="h-3 w-24 bg-[var(--border)] rounded" />
                  </div>
                  <div className="h-3 w-16 bg-[var(--border)] rounded" />
                </div>
              ))}
            </>
          ) : (
            mergedCelebrations.map((celebration, i) => (
              <EventCard
                key={i}
                icon={
                  celebration.type === "birthday" ? (
                    <Cake className="text-pink-600" size={18} />
                  ) : (
                    <Award className="text-blue-600" size={18} />
                  )
                }
                iconBg={
                  celebration.type === "birthday"
                    ? "bg-pink-500/20"
                    : "bg-blue-500/20"
                }
                iconColor={
                  celebration.type === "birthday"
                    ? "text-pink-500"
                    : "text-blue-500"
                }
                name={
                  celebration.title
                }
                subtitle={
                  celebration.subtitle
                }
                date={celebration.date}
              />
            ))
          )}
        </div>

      </div>


      <div className="flex justify-between w-full mb-6">
        <div className="relative w-full max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          />
          <Input
            type="text"
            placeholder="Search leave requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {allowedTabs.length >= 2 && (
          <TabsList className="sm:flex hidden mb-6 rounded-2xl bg-[var(--foreground)]/10">
            {allowedTabs.includes("leave-management") && (
              <TabsTrigger
                value="leave-management"
                className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)]"
              >
                Leave Requests
              </TabsTrigger>
            )}
            {allowedTabs.includes("holidays") && (
              <TabsTrigger
                value="holidays"
                className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)]"
              >
                Holidays
              </TabsTrigger>
            )}
          </TabsList>
        )}
        {allowedTabs.length >= 2 && (
          <div className="sm:hidden text-[var(--foreground)] mb-3">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {allowedTabs.includes("leave-management") && (
                  <SelectItem value="leave-management">Leave Requests</SelectItem>
                )}
                {allowedTabs.includes("holidays") && (
                  <SelectItem value="holidays">Holidays</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
        <TabsContent value="leave-management">
          <div className="border border-[var(--border)] rounded-lg p-5">
            <div className="flex justify-between items-center">
              <div className="flex justify-between w-full items-center">
                <div>
                  <h1 className="font-bold">Leave Requests</h1>
                  <p className="mb-3">Manage employee leave applications</p>
                </div>
                <div className="flex gap-3">
                  {showDeleteButton && (
                    <Button
                      disabled={selectedRequests.length === 0}
                      onClick={() => {
                        setOpenDeleteDialog(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Selected ({selectedRequests.length})
                    </Button>
                  )}
                  {!showDeleteButton && hasPermission("HR Management", "Delete Records") && (
                    <Button
                      onClick={() => {
                        setShowDeleteButton(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Bulk delete
                    </Button>
                  )}
                  {showDeleteButton && (

                    <Button
                      onClick={() => {
                        setShowDeleteButton(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X />
                      Cancel
                    </Button>

                  )}
                </div>
              </div>
            </div>
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                      {showDeleteButton && (
                        <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                          Select
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-[var(--card-foreground)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      // SHIMMER / SKELETON ROWS
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr
                          key={i}
                          className="border-b border-[var(--border)] animate-pulse"
                        >
                          {/* <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[var(--border)]" />
                            <div>
                              <div className="h-4 w-32 bg-[var(--border)] rounded mb-2" />
                              <div className="h-3 w-24 bg-[var(--border)]/60 rounded" />
                            </div>
                          </div>
                        </td> */}
                          {showDeleteButton && (
                            <td className="px-10 py-4">
                              <div className="h-4 w-4 bg-[var(--border)] rounded" />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-[var(--border)] rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-[var(--border)] rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-40 bg-[var(--border)] rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-12 bg-[var(--border)] rounded-full" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-20 bg-[var(--border)] rounded-full" />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <div className="h-8 w-8 rounded bg-[var(--border)]" />
                              <div className="h-8 w-8 rounded bg-[var(--border)]" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={showDeleteButton ? 7 : 6} className="p-0">
                          <EmptyState 
                            icon={Calendar}
                            title="No leave requests found"
                            subtitle="Try adjusting your search or filters"
                          />
                        </td>
                      </tr>
                    ) : (
                      // MAIN CONTENT: Pending always first
                      (() => {
                        const sorted = [...leaveRequests].sort((a, b) => {
                          const order = {
                            pending: 0,
                            approved: 1,
                            rejected: 2,
                          };
                          return (
                            (order[a.status] ?? 3) - (order[b.status] ?? 3)
                          );
                        });

                        return sorted.map((request) => (
                          <tr
                            key={request._id}
                            className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)]/40 transition-all"
                          >
                            {showDeleteButton && (
                              <td className="px-10 py-4">
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRequests((prev) => [
                                        ...prev,
                                        request._id,
                                      ]);
                                    } else {
                                      setSelectedRequests((prev) =>
                                        prev.filter((id) => id !== request._id)
                                      );
                                    }
                                  }}
                                />
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-semibold text-sm text-[var(--card-foreground)]">
                                    {request.employee?.firstName}{" "}
                                    {request.employee?.lastName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                              {request.leaveType?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                              {request.startDate?.split("T")[0]} to{" "}
                              {request.endDate?.split("T")[0]}
                            </td>
                            <td className="px-6 py-4.">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--border)] text-[var(--foreground)]">
                                {request.days}{" "}
                                {request.days === 1 ? "day" : "days"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                                  : request.status === "approved"
                                    ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                    : "bg-red-500/20 text-red-700 dark:text-red-400"
                                  }`}
                              >
                                {request.status.charAt(0).toUpperCase() +
                                  request.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                {["pending", "rejected"].includes(
                                  request.status
                                ) && (
                                    <CustomTooltip tooltipContent="Approve Request">
                                      <Button
                                        onClick={() => {
                                          setOpenApproveDialog(true);
                                          setSelectedRequest(request._id);
                                        }}
                                        className="h-8 w-8 p-0 bg-transparent hover:bg-green-500/20 text-green-600"
                                        size="icon"
                                      >
                                        <Check size={16} />
                                      </Button>
                                    </CustomTooltip>
                                  )}
                                {request.status === "approved" && (
                                  <CustomTooltip tooltipContent="Reject Request">
                                    <Button
                                      onClick={() => {
                                        setOpenRejectDialog(true);
                                        setSelectedRequest(request._id);
                                      }}
                                      className="h-8 w-8 p-0 bg-transparent hover:bg-red-500/20 text-red-600"
                                      size="icon"
                                    >
                                      <X size={16} />
                                    </Button>
                                  </CustomTooltip>
                                )}
                              </div>
                            </td>
                          </tr>
                        ));
                      })()
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {leaveRequests.length > 0 && !loading && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)]">
                  <p className="flex justify-between w-full gap-3 items-center">
                    Showing {leaveRequests.length} of{" "}
                    {paginationData.totalItems} requests
                  </p>
                  <Pagination
                    total={paginationData.totalItems}
                    current={paginationData.page}
                    pageSize={paginationData.size}
                    lastPage={paginationData.lastPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="holidays">
          <div className="border border-[var(--border)] rounded-lg p-5">
            <div className="flex justify-between">
              <div>
                <h1 className="font-bold">Company Holidays</h1>
                <p className="mb-3">Official holidays and observances</p>
              </div>
              <div className="flex gap-3">
                <div>
                  {hasPermission("HR Management", "Create Records") && (
                    <Button onClick={() => setShowHolidayDialog(true)}>
                      Add Holiday
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  {showDeleteButton && (
                    <Button
                      disabled={selectedRequests.length === 0}
                      onClick={() => {
                        setOpenDeleteDialog(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Selected ({selectedRequests.length})
                    </Button>
                  )}
                  {!showDeleteButton && (
                    <Button
                      onClick={() => {
                        setShowDeleteButton(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Bulk delete
                    </Button>
                  )}
                  {showDeleteButton && (
                    <Button
                      onClick={() => {
                        setShowDeleteButton(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X></X>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {showDeleteButton && (
                        <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                          Select
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Holiday
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: paginationData.size }).map(
                        (_, i) => (
                          <tr
                            key={i}
                            className="border-b border-[var(--border)] animate-pulse"
                          >
                            {showDeleteButton && (
                              <td className="px-10 py-4">
                                <div className="h-4 bg-[var(--border)] rounded w-4"></div>
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <div className="h-4 bg-[var(--border)] rounded w-32"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 bg-[var(--border)] rounded w-24"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 bg-[var(--border)] rounded w-20"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 bg-[var(--border)] rounded w-20"></div>
                            </td>
                          </tr>
                        )
                      )
                    ) : leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={showDeleteButton ? 5 : 4} className="p-0">
                          <EmptyState 
                            icon={PartyPopper}
                            title="No holidays found"
                            subtitle="Add company holidays and observances"
                          />
                        </td>
                      </tr>
                    ) : (
                      leaveRequests.map((request) => (
                        <tr
                          key={request._id}
                          className="border-b border-[var(--border)] hover:bg-[var(--border)]/30"
                        >
                          {showDeleteButton && (
                            <td className="px-10 py-4">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRequests((prev) => [
                                      ...prev,
                                      request._id,
                                    ]);
                                  } else {
                                    setSelectedRequests((prev) =>
                                      prev.filter((id) => id !== request._id)
                                    );
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 font-medium">
                            {request.holiday}
                          </td>
                          <td className="px-6 py-4">
                            {request.holidayDate?.split("T")[0]}
                          </td>
                          <td className="px-6 py-4">
                            <Chip status={request.type}></Chip>
                          </td>
                          <td className="px-6 py-4">
                            <Chip status={request.status}></Chip>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {leaveRequests.length > 0 && !loading && (
                <div className="mt-6 flex justify-between items-center px-6 pb-4 text-sm text-[var(--muted-foreground)]">
                  <p>
                    Showing {leaveRequests.length} of{" "}
                    {paginationData.totalItems} holidays
                  </p>
                  <Pagination
                    total={paginationData.totalItems}
                    current={paginationData.page}
                    pageSize={paginationData.size}
                    lastPage={paginationData.lastPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            Policies section coming soon...
          </div>
        </TabsContent>
      </Tabs>

      <GlobalDialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        label="Add new request"
      >
        <CreateDialog
          employees={employees}
          leaveTypes={leaveTypes}
          upcomingCelebrations={mergedCelebrations}
          onclose={() => {
            setShowRequestDialog(false);
            fetchLeaveRequests(1, "", activeTab);
            fetchHRStats();
          }}
        // onSuccess={() => {
        //
        // }}
        />
      </GlobalDialog>

      <GlobalDialog
        open={showHolidayDialog}
        onClose={() => setShowHolidayDialog(false)}
        label="Add holiday"
      >
        <HolidayDialog
          onclose={() => {
            setShowHolidayDialog(false);
            fetchLeaveRequests(1, "", activeTab);
            fetchHRStats();
          }}
          leaveTypes={leaveTypes}
        />
      </GlobalDialog>

      <Confirmation
        open={openApproveDialog}
        onClose={() => {
          setOpenApproveDialog(false);
          setSelectedRequest(null);
        }}
        title="Approve Leave Request"
        className="bg-green-500/10 text-green-600"
        btnClassName="bg-green-500 hover:bg-green-600"
        onConfirm={onApprove}
      />

      <Confirmation
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
        }}
        onConfirm={handleBulkDelete}
        title={"Delete requests"}
      ></Confirmation>

      <Confirmation
        open={openRejectDialog}
        onClose={() => {
          setOpenRejectDialog(false);
          setSelectedRequest(null);
        }}
        title="Reject Leave Request"
        className="bg-red-500/10 text-red-600"
        btnClassName="bg-red-500 hover:bg-red-600"
        onConfirm={onReject}
      />
    </div>
  );
}

export default HRManagement;
