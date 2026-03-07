// src/Attendee.jsx
import React, { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  XCircle,
  Upload,
  Search,
  Trash2,
  Edit,
  UserCheck,
} from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlobalDialog from "@/models/GlobalDialog";
import CreateDialog from "@/models/attandence/CreateDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import ImportDialog from "@/models/ImportDialog";
import { toast } from "sonner";
import StatCard from "@/components/Stats";
import Pagination from "@/components/UsePagination";
import extractTimeFromISO from "@/utils/dateFormat";
import Confirmation from "@/models/Confirmation";
import Chip from "@/components/Chip";
import { useTabs } from "@/context/TabsContext";
import CustomTooltip from "@/components/Tooltip";
import { apiDelete, apiGet, apiGetByFilter } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";
const Attendee = () => {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  // ─── States ───
  const [showMarkAttendanceDialog, setShowMarkAttendanceDialog] =
    useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]); // Real API data
  const [loading, setLoading] = useState(false);
  const [statLoading, setStatLoading] = useState(false);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calendar
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const daysInMonth = endOfMonth.date();
  const startDay = startOfMonth.day();
  const monthLabel = currentDate.format("MMMM YYYY");
  const [statistics, setStatistics] = useState([]);
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin || false;

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Dummy data (baqi sections same)
  // const absentEmployees = [
  //   { name: "Robert Martinez", dept: "Engineering", reason: "Sick Leave" },
  //   { name: "Amy Chen", dept: "Sales", reason: "Personal" },
  // ];

  const hasPermissions = (moduleName, requiredAction) => {
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


  // const weeklyData = [
  //   {
  //     day: "Monday",
  //     present: 235,
  //     absent: 8,
  //     leave: 4,
  //     late: 5,
  //     rate: "95.1%",
  //   },
  //   {
  //     day: "Tuesday",
  //     present: 238,
  //     absent: 5,
  //     leave: 4,
  //     late: 3,
  //     rate: "96.4%",
  //   },
  //   {
  //     day: "Wednesday",
  //     present: 240,
  //     absent: 4,
  //     leave: 3,
  //     late: 2,
  //     rate: "97.2%",
  //   },
  //   {
  //     day: "Thursday",
  //     present: 237,
  //     absent: 6,
  //     leave: 4,
  //     late: 4,
  //     rate: "96.0%",
  //   },
  //   {
  //     day: "Friday",
  //     present: 242,
  //     absent: 3,
  //     leave: 2,
  //     late: 1,
  //     rate: "98.0%",
  //   },
  // ];

  // const attendanceData = {
  //   "2025-10-06": "present",
  //   "2025-10-07": "absent",
  //   "2025-10-09": "leave",
  //   "2025-10-10": "present",
  // };

  async function handleDelete() {
    try {
      await apiDelete(`attendance/delete/${selectedAttendance?._id}`);
      toast.success("Employee deleted");
      fetchActiveEmployees();
      setOpenConfirmation(false);
      fetchTodayAttendance();
      fetchStats(selectedDate);
    } catch (error) {
      toast.error("Failed to delete");
    }
  }

  async function fetchWeeklyAttendanceStatistics() {
    setStatLoading(true);
    try {
      const data = await apiGet(`attendance/get-weekly-statics`);
      setStatistics(data?.statistics);
    } catch (error) {
      console.log(error);
    } finally {
      setStatLoading(false);
    }
  }

  function calculateWorkedHours(data) {
    const { checkInTime, checkOutTime } = data;

    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return 0;
    }

    let diffMs = checkOutDate - checkInDate;

    // If negative -> shift crossed midnight
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }

    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.round(diffHours); // ✅ Rounded value
  }

  // ─── CSV EXPORT ───
  const exportToCSV = async () => {
    try {
      const data = await apiGetByFilter(`attendance/get-by-filter`, {
        page: 1,
        size: 999999,
        sort: "createdAt",
        order: "desc",
        date: selectedDate.format("YYYY-MM-DD"),
      });

      if (!data.isSuccess || !data.filteredData?.attendances?.length) {
        toast.error("No attendance data to export");
        return;
      }

      const csvData = data.filteredData.attendances.map(att => ({
        'Employee Name': `${att.employee?.firstName || ''} ${att.employee?.lastName || ''}`.trim(),
        'Email': att.employee?.companyEmail || '',
        'Department': att.employee?.department?.name || '',
        'Date': selectedDate.format("YYYY-MM-DD"),
        'Check In': extractTimeFromISO(att?.checkInTime) === "05:00 AM" ? '' : extractTimeFromISO(att?.checkInTime),
        'Check Out': extractTimeFromISO(att?.checkOutTime) === "05:00 AM" ? '' : extractTimeFromISO(att?.checkOutTime),
        'Worked Hours': calculateWorkedHours(att) === 0 ? '' : `${calculateWorkedHours(att)} hours`,
        'Status': att.status || ''
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${selectedDate.format("YYYY-MM-DD")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${data.filteredData.attendances.length} attendance records exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  // ─── Fetch Functions ───
  const fetchActiveEmployees = async (dateParam = selectedDate) => {
    try {
      const dateString = dayjs(dateParam).format("YYYY-MM-DD"); // format date as string
      const data = await apiGet(`employee/get-attendance-employees/${dateString}`);
      if (data.isSuccess) setActiveEmployees(data.employees || []);
    } catch (err) { }
  };

  const fetchStats = async (dateParam = selectedDate) => {
    try {
      setStatLoading(true);
      const dateString = dayjs(dateParam).format("YYYY-MM-DD"); // format date as string
      const data = await apiGet(`attendance/get-stats/${dateString}`);
      if (data.isSuccess) setStats(data.stats || {});
      setStatLoading(false);
    } catch (err) {
      setStatLoading(false);
    }
  };

  const fetchTodayAttendance = async (page = 1) => {
    setLoading(true);
    try {
      const data = await apiGetByFilter(`attendance/get-by-filter`, {
        page,
        size: pagination.size,
        sort: "createdAt",
        order: "desc",
        date: selectedDate.format("YYYY-MM-DD"),
      });

      if (data.isSuccess) {
        setAttendanceList(data.filteredData?.attendances || []);
        setPagination({
          page: data.filteredData?.pagination?.page || 1,
          size: data.filteredData?.pagination?.size || 10,
          totalItems: data.filteredData?.pagination?.totalItems || 0,
          totalPages: data.filteredData?.pagination?.totalPages || 1,
          lastPage: data.filteredData?.pagination?.lastPage || 1,
        });
      }
    } catch (err) {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const findPresentAttendancePercentage = () => {
    const presentCount = attendanceList.filter(
      (item) => item.status === "present"
    ).length;

    return (presentCount / stats?.totalEmployees) * 100;
  };

  const findAbsentAttendancePercentage = () => {
    const absentCount = attendanceList.filter(
      (item) => item.status === "absent"
    ).length;

    return (absentCount / stats?.totalEmployees) * 100;
  };

  const findOnLeaveAttendancePercentage = () => {
    const leaveCount = attendanceList.filter(
      (item) => item.status === "on-leave"
    ).length;

    return (leaveCount / stats?.totalEmployees) * 100;
  };

  const findLateArrivalAttendancePercentage = () => {
    const lateCount = attendanceList.filter(
      (item) => item.status === "late-arrival"
    ).length;

    return (lateCount / stats?.totalEmployees) * 100;
  };

  // ─── Effects ───
  useEffect(() => {
    fetchActiveEmployees();
    fetchWeeklyAttendanceStatistics();
    fetchStats(selectedDate); // send the selected date
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTodayAttendance(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, selectedDate]);

  // ─── Handlers ───
  const handleDateClick = (newDate) => {
    if (!newDate) return;

    // Set as dayjs object
    setSelectedDate(newDate);

    // Call APIs with dayjs object
    fetchStats(newDate);
    fetchActiveEmployees(newDate);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      fetchTodayAttendance(newPage);
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "present":
  //     case "Present":
  //       return "text-green-600 dark:text-green-500 bg-green-600/20";
  //     case "absent":
  //     case "Absent":
  //       return "text-red-500 bg-red-500/20";
  //     case "leave":
  //     case "On Leave":
  //       return "text-yellow-700 dark:text-yellow-500 bg-yellow-600/20";
  //     case "late":
  //     case "Late":
  //       return "text-orange-500 bg-orange-600/20";
  //     default:
  //       return "text-gray-600 bg-gray-600/20";
  //   }
  // };

  // ─── Skeleton ───
  const SkeletonRow = () => (
    <tr className="border-b border-b-[var(--border)] animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-[var(--border)] rounded"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Attendance Management
          </h1>
          <p className="text-gray-500 text-sm">
            Track daily attendance and manage employee check-ins
          </p>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {hasPermissions("Attendance", 'Export Data') && (
            <Button 
              onClick={exportToCSV}
              disabled={loading}
              className="border-button flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          )}

          {hasPermissions("Attendance", 'Create Records') && (
            <Button
              className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="w-4 h-4" />
              Import Attendance
            </Button>
          )}

          {hasPermissions("Attendance", 'Create Records') && (
            <Button
              className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
              onClick={() => {
                setShowMarkAttendanceDialog(true), setSelectedAttendance(null);
              }}
            >
              + Mark Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees}
          isLoading={statLoading}
        />
        <StatCard
          title="Present Today"
          valueClass={"text-green-500"}
          value={stats?.presentAttendance}
          subtitle={findPresentAttendancePercentage().toFixed(2) + "%"}
          isLoading={statLoading}
        />
        <StatCard
          title="Absent"
          valueClass={"text-red-500"}
          value={stats?.absentAttendance}
          subtitle={findAbsentAttendancePercentage().toFixed(2) + "%"}
          isLoading={statLoading}
        />
        <StatCard
          title="On Leave"
          valueClass={"text-blue-500"}
          value={stats?.onLeave}
          subtitle={findOnLeaveAttendancePercentage().toFixed(2) + "%"}
          isLoading={statLoading}
        />
        <StatCard
          title="Late Arrival"
          valueClass={"text-orange-500"}
          subtitle={findLateArrivalAttendancePercentage().toFixed(2) + "%"}
          value={stats?.lateArrival}
          isLoading={statLoading}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Table */}
        <div className="lg:col-span-2 p-0 rounded-xl border border-[var(--border)] shadow-sm">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 p-5">
            <div>
              <h2 className="text-lg font-semibold">Today's Attendance</h2>
              <p className="text-sm text-gray-500">
                {/* { selectedDate } - Real-time updates */}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-48 pl-10"
        />
      </div> */}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border border-[var(--border)] cursor-pointer rounded-sm px-3 py-2 w-full sm:w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className=" cursor-pointer " value="all">
                    All Attendance
                  </SelectItem>
                  <SelectItem className=" cursor-pointer " value="present">
                    Present
                  </SelectItem>
                  <SelectItem className=" cursor-pointer " value="absent">
                    Absent
                  </SelectItem>
                  <SelectItem className=" cursor-pointer " value="late">
                    Late
                  </SelectItem>
                  <SelectItem className=" cursor-pointer " value="leave">
                    On Leave
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Wrapper for Mobile */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-sm border-t border-gray-100">
              <thead>
                <tr className="text-[var(--text)] border-b border-b-[var(--border)]">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Worked Hours</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {/* No attendance recorded for this date */}
                      <EmptyState icon={UserCheck} title="No attendance recorded for this date" subtitle="Mark attendance to see records"></EmptyState>
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((att) => {
                    const emp = att.employee || {};
                    const name =
                      `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                      "Unknown";
                    const dept = emp.department?.name || "-";

                    return (
                      <tr
                        key={att._id}
                        className="text-center border-b border-b-[var(--border)] hover:bg-[var(--border)]/50 transition"
                      >
                        <td className="p-3">{name}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-[var(--foreground)] bg-[var(--border)]">
                            {dept}
                          </span>
                        </td>
                        <td className="p-3">
                          {extractTimeFromISO(att?.checkInTime) == "05:00 AM"
                            ? "-"
                            : extractTimeFromISO(att?.checkInTime)}
                        </td>
                        <td className="p-3">
                          {extractTimeFromISO(att?.checkOutTime) == "05:00 AM"
                            ? "-"
                            : extractTimeFromISO(att?.checkOutTime)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium text-[var(--foreground)] ${calculateWorkedHours(att) == 0
                              ? "bg-transparent"
                              : "bg-[var(--border)]"
                              }`}
                          >
                            {calculateWorkedHours(att) == 0
                              ? "-"
                              : calculateWorkedHours(att) + " hours"}
                          </span>
                        </td>
                        <td className="p-3 w-32">
                          <Chip status={att.status} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            {hasPermissions("Attendance", 'Edit Records') && (
                              <CustomTooltip tooltipContent="Update Attendance">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setShowMarkAttendanceDialog(true);
                                    setSelectedAttendance(att);
                                  }}
                                  className={"border-button"}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </CustomTooltip>
                            )}
                            {hasPermissions("Attendance", 'Edit Records') && (
                              <CustomTooltip tooltipContent="Delete Attendance">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setOpenConfirmation(true);
                                    setSelectedAttendance(att);
                                  }}
                                  className={"logout-button"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </CustomTooltip>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {attendanceList.length > 0 && !loading && (
            <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center text-sm">
              <p className="text-gray-500 text-center sm:text-left">
                Showing {attendanceList.length} of {pagination.totalItems}
              </p>

              <Pagination
                current={pagination.page}
                total={pagination.totalItems}
                pageSize={pagination.size}
                lastPage={pagination.lastPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Calendar + Absentees */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="p-5 rounded-xl border border-[var(--border)] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Attendance Calendar</h2>
              <div className="flex items-center gap-2">
                <button
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentDate(currentDate.subtract(1, "month"))
                  }
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <p className="text-sm font-medium">{monthLabel}</p>
                <button
                  className="cursor-pointer"
                  onClick={() => setCurrentDate(currentDate.add(1, "month"))}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            {/* Calendar */}
            <div className="grid grid-cols-7 text-center text-sm gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i} className="p-2" />;

                // Clone currentDate and set the day to avoid mutating currentDate
                const date = currentDate.clone().set("date", day);

                // Format for API or key lookup
                const dateKey = date.format("YYYY-MM-DD");

                // Check if this day is selected
                const isSelected = selectedDate?.isSame(date, "day");

                // Disable future dates
                const isFuture = date.isAfter(dayjs(), "day");

                return (
                  <div
                    key={i}
                    onClick={() => !isFuture && handleDateClick(date)} // Pass dayjs object
                    className={`p-2 rounded-lg ${isFuture
                      ? "text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "ring-2 ring-[var(--primary)] cursor-pointer"
                        : "hover:bg-[var(--border)] cursor-pointer"
                      }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Absentees */}
          <div className="p-5 rounded-xl border border-[var(--border)] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Today's Absentees</h2>
              <p className="text-sm text-gray-500">
                {stats?.absentAttendance == 1
                  ? "1 employee absent"
                  : stats?.absentAttendance + " employees absent"}
              </p>
            </div>
            <div className="space-y-3">
              {attendanceList
                .filter(
                  (att) => att.status === "absent" || att.status === "on-leave"
                )
                .map((att, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded-md hover:bg-[var(--border)] transition"
                  >
                    <div>
                      <p className="font-medium text-[var(--text)]">
                        {att.employee?.firstName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {att.employee?.department?.name}
                      </p>
                    </div>
                    <Chip status={att.status}></Chip>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Statistics */}
      <div className="border border-[var(--border)] shadow-md rounded-lg mt-7 overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <h1 className="text-lg font-semibold mb-1">
            Weekly Attendance Statistics
          </h1>
          <p className="text-gray-500">Attendance breakdown for this week</p>
        </div>

        {/* Table Scroll Wrapper */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="text-center border-b border-[var(--border)] bg-[var(--muted)]/30 dark:bg-slate-900/30">
                <th className="py-2 px-3 font-semibold">Day</th>
                <th className="py-2 px-3 font-semibold">Present</th>
                <th className="py-2 px-3 font-semibold">Absent</th>
                <th className="py-2 px-3 font-semibold">On Leave</th>
                <th className="py-2 px-3 font-semibold">Late</th>
                <th className="py-2 px-3 font-semibold">Attendance Rate</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // --- SKELETON ROWS ---
                Array.from({ length: 7 }).map((_, i) => (
                  <tr
                    key={i}
                    className="animate-pulse border-b border-[var(--border)]"
                  >
                    <td className="py-3 px-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10 mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-14 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : statistics.length === 0 ? (
                // --- EMPTY STATE ---
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No attendance statistics found for this week
                  </td>
                </tr>
              ) : (
                // --- ACTUAL DATA ---
                statistics.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[var(--border)] last:border-none text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <td className="py-3 px-3 font-medium">{item.day}</td>

                    <td className="py-3 px-3 text-green-600">
                      <div className="flex items-center gap-1 justify-center">
                        <CheckCircle className="w-4 h-4" />
                        {item.present}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-red-600">
                      <div className="flex items-center gap-1 justify-center">
                        <XCircle className="w-4 h-4" />
                        {item.absent}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-blue-600">{item.leave}</td>
                    <td className="py-3 px-3 text-orange-600">{item.late}</td>

                    <td className="py-3 px-3">
                      <span className="bg-green-600/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-md font-semibold">
                        {item.rate}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <GlobalDialog
        open={showMarkAttendanceDialog}
        label={"Mark attendance"}
        onClose={() => setShowMarkAttendanceDialog(false)}
      >
        <CreateDialog
          employees={activeEmployees}
          currentDate={selectedDate}
          selectedAttendance={selectedAttendance}
          onClose={() => {
            setShowMarkAttendanceDialog(false);
            fetchTodayAttendance(pagination.page);
            fetchActiveEmployees(selectedDate);
            fetchWeeklyAttendanceStatistics();
            setSelectedAttendance(null);
            fetchStats();
          }}
        />
      </GlobalDialog>

      <GlobalDialog
        open={showImportDialog}
        label={"Import Attendance"}
        onClose={() => {
          setShowImportDialog(false);
        }}
      >
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={() => {
            fetchTodayAttendance();
            fetchStats();
            fetchWeeklyAttendanceStatistics();
          }}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        onConfirm={handleDelete}
      ></Confirmation>
    </div>
  );
};

export default Attendee;
