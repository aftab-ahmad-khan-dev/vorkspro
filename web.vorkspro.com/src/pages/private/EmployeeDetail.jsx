import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Pencil,
  Trophy,
  Briefcase,
  Trash2,
  Target,
  Laptop,
  Smartphone,
  KeyRound,
  User,
  CalendarX,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import GlobalDialog from "@/models/GlobalDialog";
import CreateDialog from "@/models/employees/CreateDialog";
import UpdateDialog from "@/models/employees/UpdateSalaryDialog";
import StatCard from "@/components/Stats";
import Confirmation from "@/models/Confirmation";
import { toast } from "sonner";
import ChangeStatusDialog from "@/models/employees/ChangeStatusDialog";
import Chip from "@/components/Chip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTabs } from "@/context/TabsContext";
import { apiDelete, apiGet, apiGetByFilter } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

function EmployeeDetail() {
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateSalaryDialog, setShowUpdateSalaryDialog] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState(null);
  const [allEmployees, setAllEmployees] = useState(null);
  const [assignedProjects, setAssignedProjects] = useState(null);
  const { actions } = useTabs()
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  // Shared data
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const urlId = window.location.pathname.split("/").pop();
  // Fetch functions (unchanged)
  const fetchRoles = async () => {
    try {
      const data = await apiGet("role/");
      setRoles(data?.roles || []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
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

  const availableTabs = [];

  useEffect(() => {
    actions?.modulePermissions?.forEach((modules) => {
      if (modules.module == "Employees") {
        // DetailTabsLength = modules.detailTabs.length

        // Build available tabs array based on permissions
        if (modules.detailTabs.includes("Salary&Compensation")) {
          availableTabs.push("salary");
        }
        if (modules.detailTabs.includes("Assigned Projects")) {
          availableTabs.push("projects");
        }
        if (modules.detailTabs.includes("Attendance")) {
          availableTabs.push("attendance");
        }
        if (modules.detailTabs.includes("Assigned Assets")) {
          availableTabs.push("assignedAssets");
        }

        // Set first available tab as default if not already set
        if (availableTabs.length > 0 && !activeTab) {
          setActiveTab(availableTabs[0]);
        }
      }
    });
  }, [actions?.modulePermissions, activeTab]);

  // useEffect(() => {
  //   console.log(DetailTabsLength)
  // }, [DetailTabsLength])

  const hasDetailTabsPermission = (moduleName, requiredTabs) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.detailTabs.includes(requiredTabs)
        }
      }
    );
  };

  const detailTabsCount = [
    hasDetailTabsPermission("Employees", "Salary&Compensation"),
    hasDetailTabsPermission("Employees", "Assigned Projects"),
    hasDetailTabsPermission("Employees", "Attendance"),
    hasDetailTabsPermission("Employees", "Assigned Assets"),
  ].filter(Boolean).length;


  // console.log(hasAnyDetailTab)

  const handleDelete = async () => {
    try {
      await apiDelete(`employee/delete/${urlId}`);
      toast.success("Employee deleted");
      navigate("/app/employees");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const fetchAssignedProjects = async () => {
    try {
      const data = await apiGet(`project/get-assigned-projects/${urlId}`);
      setAssignedProjects(data?.filteredData?.projects || []);
    } catch (error) {
      console.error("Failed to fetch assigned projects", error);
    }
  };


  useEffect(() => {
    fetchAssignedProjects();
  }, [activeTab == 'projects']);

  const fetchDepartment = async () => {
    try {
      const data = await apiGet("department/get-active-list");

      if (data.isSuccess && data.filteredData?.departments) {
        const depts = data.filteredData.departments;
        setDepartments(depts);

        const allSubs = [];
        const seenIds = new Set();
        depts.forEach((dept) => {
          if (Array.isArray(dept.subDepartments)) {
            dept.subDepartments.forEach((sub) => {
              if (sub.isActive && !seenIds.has(sub._id)) {
                seenIds.add(sub._id);
                allSubs.push({
                  _id: sub._id,
                  name: sub.name,
                  description: sub.description || "",
                  isActive: sub.isActive,
                  department: sub.department,
                });
              }
            });
          }
        });
        setSubDepartments(allSubs);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const data = await apiGet("leave-type/get-all");
      setLeaves(data?.filteredData?.leaveType || []);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const fetchEmployeeDetails = async () => {
    setLoadingData(true);
    try {
      const data = await apiGet(`employee/get-detail/${urlId}`);
      if (data.isSuccess) {
        setAttendanceStats(data?.attendanceStats);
        setEmployee(data.employee);
        setSalaryHistory(data.salaryHistory);
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await apiGetByFilter("employee/get-active-employees", {});
      if (data.isSuccess) {
        setAllEmployees(data?.filteredData?.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAssignedAssets = async () => {
    setAssetsLoading(true);
    try {
      const data = await apiGet(`admin-and-assets/get-by-id/${urlId}`);
      if (data.isSuccess) {
        setAssignedAssets(data?.adminAndAssets || []);
      }
    } catch (error) {
      console.error("Error fetching assigned assets:", error);
    } finally {
      setAssetsLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      await Promise.all([
        fetchEmployeeDetails(),
        fetchRoles(),
        fetchDepartment(),
        fetchLeaves(),
        fetchEmployees(),
        fetchAssignedAssets(),
      ]);
      setLoadingData(false);
    };
    loadAll();
  }, [urlId]);

  // Helper
  const get = (val, fallback = "N/A") => (val ? val : fallback);
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      : "N/A";

  // CUSTOM SKELETON — NO PACKAGE
  if (loadingData) {
    return (
      <div className="min-h-screen p-8 space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-10 w-32 bg-[var(--border)] rounded"></div>
            <div className="h-6 w-48 ml-28 bg-[var(--border)] rounded"></div>
          </div>
          <div className="h-10 w-36 bg-[var(--border)] rounded"></div>
        </div>

        {/* Main Card */}
        <div className="space-y-6">
          {/* Employee Header */}
          <div className="p-6 border border-[var(--border)] rounded-2xl space-y-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--border)]"></div>
              <div className="space-y-3 flex-1">
                <div className="h-7 w-64 bg-[var(--border)] rounded"></div>
                <div className="h-5 w-48 bg-[var(--border)] rounded"></div>
                <div className="flex gap-3">
                  <div className="h-6 w-32 bg-[var(--border)] rounded"></div>
                  <div className="h-6 w-28 bg-[var(--border)] rounded"></div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[var(--border)] rounded"></div>
                  <div className="h-4 w-44 bg-[var(--border)] rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="h-12 w-full max-w-md bg-[var(--border)] rounded-2xl mb-6"></div>

            {/* Salary Tab */}
            <div className="p-6 border border-[var(--border)] rounded-2xl space-y-8">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-[var(--border)] rounded"></div>
                  <div className="h-4 w-56 bg-[var(--border)] rounded"></div>
                </div>
                <div className="h-10 w-36 bg-[var(--border)] rounded"></div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border border-[var(--border)] rounded-lg p-5 space-y-3"
                  >
                    <div className="h-4 w-24 bg-[var(--border)] rounded"></div>
                    <div className="h-10 w-32 bg-[var(--border)] rounded"></div>
                    <div className="h-3 w-16 bg-[var(--border)] rounded"></div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="h-5 w-32 bg-[var(--border)] rounded"></div>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <div className="h-48 w-full bg-[var(--border)]/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return <div className="p-8 text-center">Employee not found.</div>;
  }

  const fullName = `${get(employee.firstName)} ${get(
    employee.lastName
  )}`.trim();
  const initials = `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""
    }`.toUpperCase();
  return (
    <div className="min-h-screen p-8">
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Back + Title + Description */}
            <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Row 1: Back (col 1) + Title (col 2) on sm+, stacked on mobile */}
              <Button
                className="border-button w-10 sm:w-10 lg:w-full  justify-center"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden lg:flex">Back</span>
              </Button>

              <h1 className="text-xl sm:text-2xl sm:ml-8 lg:ml-0 font-bold text-[var(--foreground)]">
                Employee Details
              </h1>

              {/* Row 2: Description (aligns under title on sm+) */}
              <p className="text-[var(--foreground)] sm:ml-8 lg:ml-0 text-sm sm:col-start-2">
                Complete employee information
              </p>
            </div>

            {/* Right: Action buttons */}
            <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:flex-wrap gap-2 sm:justify-end">
              {hasPermission("Employees", "Edit Records") && (
                <Button
                  className="border-button w-full sm:w-auto justify-center"
                  onClick={() => setShowStatusDialog(true)}
                >
                  <span className="flex gap-2 items-center justify-center">
                    <Target className="w-4 h-4" /> Change status
                  </span>
                </Button>
              )}

              {
                hasPermission("Employees", "Edit Records") && (
                  <Button
                    className="border-button w-full sm:w-auto justify-center"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <span className="flex gap-2 items-center justify-center">
                      <Pencil className="w-4 h-4" /> Edit Employee
                    </span>
                  </Button>
                )
              }

              {employee?.isDeleted === false && hasPermission("Employees", "Delete Records") && (
                <Button
                  className="logout-button w-full sm:w-auto justify-center"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <span className="flex gap-2 items-center justify-center">
                    <Trash2 className="w-4 h-4" /> Delete Employee
                  </span>
                </Button>
              )}

            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-lg">
          <div className="p-4 sm:p-6 border border-[var(--border)] rounded-2xl">
            {/* Top section */}
            <div className="flex flex-row items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold bg-[var(--border)] text-[var(--foreground)]">
                {initials || "NA"}
              </div>

              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">
                  {fullName}
                </h2>
                <p className="text-[var(--foreground)] text-xs sm:text-sm mt-1">
                  {get(employee.jobTitle)}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Chip status={employee?.status} />
                  <span className="px-2 py-1 border border-[var(--border)] rounded-lg text-[var(--foreground)] text-[10px] sm:text-xs">
                    {get(employee.department?.name)}
                  </span>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-5 text-xs sm:text-sm">
              <div className="flex items-start gap-2 text-[var(--foreground)] break-words">
                <Mail className="w-4 h-4 mt-[2px] shrink-0" />
                <span className="truncate sm:whitespace-normal">
                  {get(employee.companyEmail)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[var(--foreground)]">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{get(employee.phone)}</span>
              </div>

              <div className="flex items-start gap-2 text-[var(--foreground)]">
                <MapPin className="w-4 h-4 mt-[2px] shrink-0" />
                <span className="break-words">
                  {[
                    employee.location?.address,
                    employee.location?.city,
                    employee.location?.state,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[var(--foreground)]">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined: {formatDate(employee.joinDate)}</span>
              </div>
            </div>
          </div>

          {/* {console.log(hasAnyDetailTab && DetailTabsLength == 2)} */}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mt-5"
          >
            {detailTabsCount > 1 && (
              <TabsList className="hidden sm:flex mb-6 rounded-2xl bg-[var(--foreground)]/10">
                {hasDetailTabsPermission("Employees", "Salary&Compensation") && (
                  <TabsTrigger value="salary" className="rounded-2xl py-2 text-sm font-medium">
                    Salary & Compensation
                  </TabsTrigger>
                )}

                {hasDetailTabsPermission("Employees", "Assigned Projects") && (
                  <TabsTrigger value="projects" className="rounded-2xl py-2 text-sm font-medium">
                    Assigned Projects
                  </TabsTrigger>
                )}

                {hasDetailTabsPermission("Employees", "Attendance") && (
                  <TabsTrigger value="attendance" className="rounded-2xl py-2 text-sm font-medium">
                    Attendance
                  </TabsTrigger>
                )}

                {hasDetailTabsPermission("Employees", "Assigned Assets") && (
                  <TabsTrigger value="assignedAssets" className="rounded-2xl py-2 text-sm font-medium">
                    Assigned Assets
                  </TabsTrigger>
                )}
              </TabsList>
            )}


            {detailTabsCount > 1 && (
              <div className="sm:hidden text-[var(--foreground)] mb-3">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasDetailTabsPermission("Employees", "Salary&Compensation") && (
                      <SelectItem value="salary">Salary & Compensation</SelectItem>
                    )}
                    {hasDetailTabsPermission("Employees", "Assigned Projects") && (
                      <SelectItem value="projects">Assigned Projects</SelectItem>
                    )}
                    {/* <SelectItem value="performance">Performance</SelectItem> */}
                    {hasDetailTabsPermission("Employees", "Attendance") && (
                      <SelectItem value="attendance">Attendance</SelectItem>
                    )}
                    {hasDetailTabsPermission("Employees", "Assigned Assets") && (
                      <SelectItem value="assignedAssets">Assigned Assets</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* // TODO: Need 1 more tab to show overview and all detail of employee */}

            <TabsContent value="salary">
              <div className="p-6 border rounded-2xl border-[var(--border)]">
                <div className="mb-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Title + description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
                        Current Salary
                      </h3>
                      <p className="text-sm text-[var(--foreground)]">
                        Salary information and history
                      </p>
                    </div>

                    {/* Right: Button */}
                    {
                      hasPermission('Employees', 'Edit Records') && (
                        <Button
                          onClick={() => setShowUpdateSalaryDialog(true)}
                          className="w-full sm:w-auto justify-center"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="ml-2">Update Salary</span>
                        </Button>
                      )
                    }
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="border border-[var(--border)] rounded-lg p-5">
                    <p className="text-sm text-[var(--foreground)] mb-1">
                      Current Salary
                    </p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                      PKR {employee.lastSalary ?? employee.baseSalary}
                    </p>
                    <p className="text-xs text-[var(--foreground)] mt-1">
                      Per month
                    </p>
                  </div>
                  <div className="border border-[var(--border)] rounded-lg p-5">
                    <p className="text-sm text-[var(--foreground)] mb-1">
                      Last Update
                    </p>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {formatDate(employee.lastSalaryIncrementDate)}
                    </p>
                    <p className="text-sm text-green-600 mt-1 font-medium">
                      {salaryHistory.length > 1
                        ? "+" +
                        salaryHistory[0].incrementPercentage +
                        "% increase"
                        : "N/A"}
                    </p>
                  </div>
                  <div className="border border-[var(--border)] rounded-lg p-5">
                    <p className="text-sm text-[var(--foreground)] mb-1">
                      Annual Package
                    </p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                      PKR{" "}
                      {(
                        (employee.lastSalary ?? employee.baseSalary) * 12 || 0
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--foreground)] mt-1">CTC</p>
                  </div>
                </div>

                <div className="border-t  border-[var(--border)] p-3">
                  <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
                    Salary History
                  </h3>
                  <div className="border border-[var(--border)] overflow-x-scroll rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="border-b border-[var(--border)]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Previous Salary
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            New Salary
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Increase
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {salaryHistory.map((salary) => (
                          <tr className="hover:bg-[var(--border)] transition-colors">
                            <td
                              key={salary.id}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {formatDate(salary.date)}
                            </td>
                            <td
                              key={salary.previousSalary}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              PKR {salary.previousSalary ?? "-"}
                            </td>
                            <td
                              key={salary.newSalary}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              PKR {salary.newSalary ?? "-"}
                            </td>
                            <td
                              key={salary.incrementPercentage}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {salary.incrementPercentage?.toFixed(2) ?? "-"} %
                            </td>
                            <td
                              key={salary.reason ?? "-"}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {salary.reason ?? "-"}
                            </td>
                          </tr>
                        ))}
                        {/* add empty state */}
                        {salaryHistory.length === 0 && (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              <EmptyState icon={History} title=" No salary history found " subtitle="This employee has no salary history yet"></EmptyState>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* // TODO: Add project list */}
            <TabsContent value="projects">
              <div className="border border-[var(--border)] rounded-2xl p-3">
                <h1 className="text-xl font-medium text-[var(--foreground)]">
                  Assigned Projects
                </h1>
                <p className="text-sm text-[var(--muted-foreground)] pb-4">
                  Projects this employee is currently working on
                </p>

                {assignedProjects?.length === 0 && (
                  <EmptyState
                    icon={Briefcase}
                    title="No projects assigned"
                    subtitle="This employee has no projects assigned yet"
                  />
                )}

                {assignedProjects?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedProjects.map((project) => (
                      <div
                        key={project._id}
                        className="border border-[var(--border)] rounded-2xl transition-all"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3 rounded-t-2xl p-2 bg-[var(--border)]/50">
                          <div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                              {project.name}
                            </h3>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {project.description || "No description"}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 text-xs rounded-full capitalize mt-3
              ${project.status === "completed"
                                ? "bg-green-500/15 text-green-500"
                                : project.status === "in progress"
                                  ? "bg-blue-500/15 text-blue-500"
                                  : "bg-yellow-500/15 text-yellow-500"
                              }
            `}
                          >
                            {project.status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 text-sm p-5">
                          <p>
                            <strong className="text-foreground">Priority:</strong>{" "}
                            <span className="capitalize text-muted-foreground">
                              {project.priority}
                            </span>
                          </p>

                          <p>
                            <strong className="text-foreground">Duration:</strong>{" "}
                            <span className="text-muted-foreground">
                              {new Date(project.startDate).toDateString()} —{" "}
                              {new Date(project.endDate).toDateString()}
                            </span>
                          </p >
                          {actions.cost &&
                            <p className="text-muted-foreground">
                              <strong className="text-foreground">Cost:</strong> ${project.cost}
                            </p>}
                        </div>

                        {/* Tags */}
                        {/* {project.tags?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 px-3 py-0">
                            {project.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )} */}

                        {/* Progress Bar */}
                        <div className="mt-4 bg-[var(--border)]/50 rounded-b-2xl p-2">
                          <p className="text-sm text-foreground font-medium">Progress</p>

                          <div className="w-full bg-[var(--border)] h-2 rounded-full mt-1">
                            <div
                              className="h-2 bg-blue-600 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            {project.progress}% Completed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            {/* // TODO: Add performance metrics */}
            <TabsContent value="performance">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 border rounded-2xl border-[var(--border)] ">
                  <h1 className="text-xl font-medium text-foreground text-var[(--text)]">
                    Performance Metrics
                  </h1>
                  <p className="text-sm text-[var(--muted-foreground)] pb-4">
                    Key performance indicators
                  </p>
                  <div className="border border-[var(--border)] rounded-2xl p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-foreground">Task Completed</p>
                        <p className="text-sm text-muted-foreground">last 6 month</p>
                      </div>
                      <div className="text-[var(--button)]">156</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-2xl border-[var(--border)] ">
                  <h1 className="text-xl font-medium text-[var(--foreground)]">
                    Recent Achievements
                  </h1>
                  <p className="text-sm text-[var(--muted-foreground)] pb-4">
                    Awards and recognitions
                  </p>

                  {employee?.achievements?.length === 0 && (
                    <EmptyState
                      icon={Trophy}
                      title="No achievements"
                      subtitle="This employee has no achievements yet"
                    />
                  )}

                  {employee?.achievements?.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="border border-[var(--border)] rounded-2xl p-3"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p>{achievement.title}</p>
                          <p className="text-sm">{achievement.date}</p>
                        </div>
                        <div className="text-[var(--button)]">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attendance">
              <div className="p-6 border rounded-2xl border-[var(--border)]">
                <div className="borer rounded-2xl border-[var(--border)]">
                  <h1 className="text-xl text-[var(--foreground)] font-medium">
                    Attendance Summary
                  </h1>
                  <p className="text-sm text-[var(--muted-foreground)] pb-4">
                    Employee attendance statistics
                  </p>
                </div>

                {/* // TODO: Add attendance metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Days"
                    value={attendanceStats?.totalDays || 0}
                    valueClass={"text-[var(--foreground)]"}
                  />
                  <StatCard
                    title="Present"
                    value={attendanceStats?.presentDays || 0}
                    valueClass={"text-green-500"}
                  />
                  <StatCard
                    title="Absent"
                    value={attendanceStats?.absentDays || 0}
                    valueClass={"text-red-500"}
                  />
                  <StatCard
                    title="Attendance Rate"
                    value={attendanceStats?.attendanceRate || 0}
                    valueClass={"text-blue-500"}
                  />
                </div>

                <div className="border-t mt-5 border-[var(--border)] p-3">
                  <h3 className="text-base font-semibold text-[var(--foreground)] mb-4">
                    Leave Allocation
                  </h3>
                  <div className="border border-[var(--border)] overflow-x-scroll rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="border-b border-[var(--border)]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Leave Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Total Days
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Utilized Days
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--foreground)]">
                            Remaining Days
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {employee?.leaveAllocation?.map((leave) => (
                          <tr className="hover:bg-[var(--border)] transition-colors">
                            <td
                              key={leave?.leaveType?.name}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {leave?.leaveType?.name ?? "Invalid leaveType"}
                            </td>
                            <td
                              key={leave.totalDays}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {leave.totalDays ?? "-"}
                            </td>
                            <td
                              key={leave.utilizedDays}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {leave.utilizedDays ?? "-"}
                            </td>
                            <td
                              key={leave.remainingDays}
                              className="px-4 py-3 text-sm text-[var(--foreground)]"
                            >
                              {leave.remainingDays ?? "-"}
                            </td>
                          </tr>
                        ))}
                        {/* add empty state */}
                        {employee?.leaveAllocation?.length === 0 && (
                          <tr>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]" colSpan={4}>
                              <EmptyState icon={CalendarX} title="No leave allocation found" subtitle="Add leave allocation for this employee "></EmptyState>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignedAssets">
              <div className="p-6 border rounded-2xl border-[var(--border)]">
                <h1 className="text-xl font-medium text-[var(--foreground)] mb-2">
                  Assigned Assets
                </h1>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">
                  Assets assigned to this employee
                </p>

                {assetsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-[var(--border)] p-5 rounded-lg animate-pulse">
                        <div className="h-10 w-10 bg-[var(--border)] rounded-md mb-3"></div>
                        <div className="h-4 bg-[var(--border)] rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-[var(--border)] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : assignedAssets.length === 0 ? (
                  <EmptyState
                    icon={Laptop}
                    title="No assigned assets"
                    subtitle="This employee has no assets assigned yet"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedAssets.map((asset) => {
                      const getAssetIcon = (type) => {
                        switch (type) {
                          case "mobile devices":
                            return <Smartphone size={20} className="text-purple-500" />;
                          case "software license":
                            return <KeyRound size={20} className="text-indigo-500" />;
                          default:
                            return <Laptop size={20} className="text-blue-500" />;
                        }
                      };

                      return (
                        <div key={asset._id} className="border border-[var(--border)] p-5 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-10 w-10 rounded-md grid place-items-center bg-blue-500/20">
                              {getAssetIcon(asset.assetType)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[var(--foreground)]">{asset.assetName}</p>
                              <p className="text-xs text-[var(--muted-foreground)]">{asset.assetType}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[var(--muted-foreground)]">Serial:</span>
                              <span className="text-[var(--foreground)] font-medium">{asset.serialNumber || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--muted-foreground)]">Value:</span>
                              <span className="text-[var(--foreground)] font-medium">PKR: {asset.value || "0"}</span>
                            </div>
                            {/* <div className="flex justify-between">
                              <span className="text-[var(--muted-foreground)]">Status:</span>
                              <span className={`font-medium capitalize ${
                                asset.status === "assigned" ? "text-green-500" :
                                asset.status === "available" ? "text-blue-500" :
                                "text-orange-500"
                              }`}>
                                {asset.status}
                              </span>
                            </div> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div >

      {/* Dialogs */}
      <GlobalDialog GlobalDialog
        open={showEditDialog}
        label="Edit Employee"
        onClose={() => setShowEditDialog(false)
        }
      >
        <CreateDialog
          employee={employee}
          roles={roles}
          departments={departments}
          subDepartments={subDepartments}
          leaves={leaves}
          allEmployees={allEmployees}
          onSuccess={() => {
            setShowEditDialog(false);
            fetchEmployeeDetails();
          }}
        />
      </GlobalDialog >

      <GlobalDialog
        open={showUpdateSalaryDialog}
        label="Update Employee Salary"
        onClose={() => setShowUpdateSalaryDialog(false)}
      >
        <UpdateDialog
          currentSalary={employee.lastSalary ?? employee.baseSalary}
          employeeId={employee._id}
          onSuccess={() => {
            setShowUpdateSalaryDialog(false);
            fetchEmployeeDetails();
          }}
        />
      </GlobalDialog>

      <GlobalDialog
        open={showStatusDialog}
        label="Change Employee Status"
        onClose={() => setShowStatusDialog(false)}
      >
        <ChangeStatusDialog
          status={employee?.status}
          employeeId={employee?._id}
          onClose={() => {
            setShowStatusDialog(false);
            fetchEmployeeDetails();
          }}
        ></ChangeStatusDialog>
      </GlobalDialog>

      <Confirmation
        name={"Employee"}
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
        }}
        onConfirm={() => handleDelete()}
      ></Confirmation>
    </div >
  );
}

export default EmployeeDetail;
