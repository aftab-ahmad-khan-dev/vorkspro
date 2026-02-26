// src/pages/Employee.jsx
import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArchiveRestore,
  Recycle,
  RefreshCw,
  RotateCcw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateDialog from "@/models/employees/CreateDialog";
import GlobalDialog from "@/models/GlobalDialog";
import Confirmation from "@/models/Confirmation";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "@/components/ProfilePicture";
import Pagination from "@/components/UsePagination";
import StatCard from "@/components/Stats";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import CustomTooltip from "@/components/Tooltip";
import Chip from "@/components/Chip";
import { useTabs } from "@/context/TabsContext";
import { apiGet, apiGetByFilter, apiPatch } from "@/interceptor/interceptor";
import EmptyState from "@/components/EmptyState";

export default function Employee() {
  /* ────────────────────── STATE ────────────────────── */
  const [activeTab, setActiveTab] = useState("currently-working");
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, statsSetLoading] = useState(false);
  const [stat, setStat] = useState({});
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]); // ← Will be filled from departments

  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 1,
    lastPage: 1,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);

  /* ────────────────────── CONSTANTS ────────────────────── */
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "employee";
  const roleBaseUrl = import.meta.env.VITE_APP_BASE_URL + "role";
  const departmentBaseUrl = import.meta.env.VITE_APP_BASE_URL + "department";
  const leaveUrl = import.meta.env.VITE_APP_BASE_URL + "leave-type";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { actions } = useTabs()
  console.log(actions)
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  /* ────────────────────── FETCH LOGIC ────────────────────── */

  const fetchEmployees = async (page = 1, search = "", status = "") => {
    setLoading(true);
    try {
      const data = await apiGetByFilter("employee/get-by-filter", {
        page,
        size: paginationData.size,
        sort: "createdAt",
        order: "desc",
        search,
        status,
      });

      if (data.isSuccess) {
        setEmployees(data.employees || []);
        setPaginationData({
          page: data.pagination.page,
          size: data.pagination.size,
          totalItems: data.pagination.totalItems,
          totalPages: data.pagination.totalPages,
          lastPage: data.pagination.lastPage,
        });
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiGet("role/get-active-roles");
      setRoles(data?.roles || []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const fetchDepartment = async () => {
    try {
      const data = await apiGet("department/get-active-list");

      if (data.isSuccess && data.filteredData?.departments) {
        const depts = data.filteredData.departments;

        // Set departments
        setDepartments(depts);
        console.log(depts)

        // Extract ALL sub-departments
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
      const data = await apiGet("leave-type/get-active-list");
      setLeaves(data?.filteredData?.leaveType || []);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const data = await apiPatch(`employee/restore-employee/${selectedEmployee._id}`, {});

      if (data.isSuccess) {
        setActiveTab("currently-working");
        fetchEmployees();
        fetchEmployeesStats();
        setOpenConfirmationDialog(false);
        setLoading(false);
        return toast.success("Employee restored successfully");
      }
    } catch (error) {
      return toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesStats = async () => {
    try {
      statsSetLoading(true);
      const data = await apiGet("employee/get-stats");
      setStat(data?.stats || {});
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      statsSetLoading(false);
    }
  };

  /* ────────────────────── EFFECTS ────────────────────── */

  useEffect(() => {
    fetchDepartment(); // ← Fetches departments + extracts sub-departments
    fetchEmployeesStats();
    fetchRoles();
    fetchLeaves();
  }, []);

  // Combined search debounce and tab change effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const status =
        activeTab === "currently-working"
          ? "active"
          : activeTab === "left-company"
            ? "left"
            : activeTab === "deleted-company"
              ? "delete"
              : "";

      fetchEmployees(1, searchTerm, status);
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for tab change

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  /* ────────────────────── PAGINATION ────────────────────── */
  const pageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.lastPage) {
      fetchEmployees(
        newPage,
        searchTerm,
        activeTab === "currently-working"
          ? "active"
          : "left-company"
            ? "left"
            : "deleted-company"
              ? "delete"
              : ""
      );
    }
  };

  /* ────────────────────── CSV EXPORT ────────────────────── */
  const exportToCSV = async () => {
    try {
      const status = activeTab === "currently-working" ? "active" : activeTab === "left-company" ? "left" : activeTab === "deleted-company" ? "delete" : "";
      
      const data = await apiGetByFilter("employee/get-by-filter", {
        page: 1,
        size: 999999,
        sort: "createdAt",
        order: "desc",
        search: searchTerm,
        status,
      });

      if (!data.isSuccess || !data.employees?.length) {
        toast.error("No data to export");
        return;
      }

      const csvData = data.employees.map(emp => ({
        'First Name': emp.firstName || '',
        'Last Name': emp.lastName || '',
        'Email': emp.companyEmail || '',
        'Department': emp.department?.name || '',
        'Sub-Department': emp.subDepartment?.name || '',
        'Position': emp.jobTitle || '',
        'Join Date': emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '',
        'Leave Date': emp.leaveDate ? new Date(emp.leaveDate).toLocaleDateString() : '',
        'Status': emp.status || ''
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
      link.setAttribute('download', `employees_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${data.employees.length} employees exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  /* ────────────────────── DIALOG HANDLERS ────────────────────── */
  const handleCreate = () => {
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleUpdate = (emp) => {
    setSelectedEmployee(emp);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDetail = (emp) => {
    navigate(`/app/employees/employee-detail/${emp._id}`);
  };

  const SkeletonRow = () => (
    <tr className="border-b border-[var(--border)] animate-pulse">
      {Array.from({ length: activeTab === "left-company" ? 8 : 7 }).map(
        (_, i) => (
          <td key={i} className="px-6 py-4">
            <div className="h-4 bg-[var(--border)] rounded w-full"></div>
          </td>
        )
      )}
    </tr>
  );

const hasPermission = (moduleName, requiredAction) => {
  if (isSuperAdmin) return true;

  return actions?.modulePermissions?.some(
    (modules) =>
    {
      const currentModule =  modules.module == moduleName
      if (currentModule == true) {
        return modules.actions.includes(requiredAction)
      }
    }
  );
};
  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Employee Management
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
            Manage your team members and their information
          </p>
        </div>

        {hasPermission("Employees", "Create Records") && (
          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Employee
          </Button>
        )}

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Workforce"
          isLoading={statsLoading}
          value={stat?.totalEmployees}
        />
        <StatCard
          title="Active Workforce"
          isLoading={statsLoading}
          valueClass="text-green-500"
          value={stat?.activeEmployees}
        />
        <StatCard
          title="Past Workforce"
          isLoading={statsLoading}
          valueClass="text-red-500"
          value={stat?.inactiveEmployees}
        />
        <StatCard
          title="New This Month"
          isLoading={statsLoading}
          valueClass="text-blue-500"
          value={stat?.thisMonthJoined}
        />
      </div>

      {/* Tabs + Search */}
      <div className="p-4 sm:p-6 border border-[var(--border)] rounded-lg mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT SIDE: Tabs / Mobile Select */}
          <div className="flex flex-col gap-3 lg:max-w-xl w-full">
            {/* Mobile Dropdown */}
            <div className="xl:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currently-working">
                    Active Workforce ({stat?.activeEmployees ?? "-"})
                  </SelectItem>
                  <SelectItem value="left-company">
                    Past Workforce ({stat?.inactiveEmployees ?? "-"})
                  </SelectItem>
                  <SelectItem value="deleted-company">
                    Archived Profiles ({stat?.archivedEmployees ?? "-"})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop / Tablet Tabs */}
            <div className="hidden xl:block">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex flex-wrap gap-2 rounded-2xl bg-[var(--foreground)]/10 p-1">
                  <TabsTrigger
                    value="currently-working"
                    className="rounded-2xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    Active Workforce ({stat?.activeEmployees ?? "-"})
                  </TabsTrigger>

                  <TabsTrigger
                    value="left-company"
                    className="rounded-2xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    Past Workforce ({stat?.inactiveEmployees ?? "-"})
                  </TabsTrigger>

                  <TabsTrigger
                    value="deleted-company"
                    className="rounded-2xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    Archived Profiles ({stat?.archivedEmployees ?? "-"})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* RIGHT SIDE: Search + Export */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto sm:items-center sm:justify-end">
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
                name="searchTermInput"
                autoComplete="new-search"
              />
            </div>

            {hasPermission("Employees", "Export Data") && (
              <Button 
                onClick={exportToCSV}
                disabled={loading}
                className="border-button w-full sm:w-auto justify-center"
              >
                <Download size={18} className="mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium min-w-56">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Sub-Department
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Join Date
                </th>
                {activeTab == "left-company" && (
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    Leave Date
                  </th>
                )}
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
                Array.from({ length: paginationData.size }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "left-company" ? 8 : 7} className="p-0">
                    <EmptyState 
                      icon={Users}
                      title="No employees found"
                      subtitle="Try adjusting your search or filters to find employees"
                    />
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => hasPermission("Employees", "View Details") && handleDetail(emp)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        hasPermission("Employees", "View Details") && handleDetail(emp);
                      }
                    }}
                    className="border-b border-[var(--border)] hover:bg-[var(--border)]/30 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProfilePicture name={emp.firstName} />
                        <div>
                          <p className="font-semibold text-sm">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {emp.companyEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className=" px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--border)]">
                        {emp.department?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {emp.subDepartment?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {emp.jobTitle || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {emp.joinDate
                        ? new Date(emp.joinDate).toLocaleDateString()
                        : "-"}
                    </td>
                    {activeTab == "left-company" && (
                      <td className="px-6 py-4 text-sm text-red-500">
                        {emp.leaveDate
                          ? new Date(emp.leaveDate).toLocaleDateString()
                          : "-"}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      <Chip status={emp.status}></Chip>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        {hasPermission("Employees", "View Details") && (
                          <CustomTooltip tooltipContent="View Details">
                            <Button
                              className={
                                "bg-transparent text-[var(--button)] hover:bg-[var(--button)]/20 hover:text-[var(--button)]"
                              }
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); handleDetail(emp); }}
                            >
                              <Eye size={16} />
                            </Button>
                          </CustomTooltip>
                        )}

                        {hasPermission("Employees", "Edit Records") && (
                          <CustomTooltip tooltipContent="Update Employee">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-transparent text-green-500 hover:bg-green-500/20 hover:text-green-500"
                              onClick={(e) => { e.stopPropagation(); handleUpdate(emp); }}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </CustomTooltip>
                        )}

                        {emp?.isDeleted && (
                          <CustomTooltip tooltipContent="Restore Employee">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-transparent text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500"
                              disabled={hasPermission("Employees", "Edit Records" ) ? false : true}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(emp);
                                setOpenConfirmationDialog(true);
                              }}
                            >
                              <RotateCcw size={16} />
                            </Button>
                          </CustomTooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {employees.length > 0 && !loading && (
        <div className="mt-6 flex justify-between items-center text-sm text-[var(--muted-foreground)]">
          <p>
            Showing {employees.length} of {paginationData.totalItems} employees
          </p>
          <Pagination
            total={paginationData.totalItems}
            current={paginationData.page}
            pageSize={paginationData.size}
            lastPage={paginationData.lastPage}
            onPageChange={pageChange}
          />
        </div>
      )}

      {/* Dialogs */}
      <GlobalDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        label={editMode ? "Update Employee" : "Create Employee"}
      >
        <CreateDialog
          totalEmployees={stat.totalEmployees}
          employee={editMode ? selectedEmployee : null}
          roles={roles}
          departments={departments}
          allEmployees={employees}
          leaves={leaves}
          onSuccess={() => {
            setOpenDialog(false);
            fetchEmployees(
              paginationData.page,
              searchTerm,
              activeTab === "currently-working" ? "active" : "left"
            );
          }}
        />
      </GlobalDialog>

      <Confirmation
        open={openConfirmationDialog}
        title={"Restore"}
        btnClassName={"bg-orange-100 text-orange-500"}
        className={"bg-orange-100 text-orange-500"}
        onClose={() => setOpenConfirmationDialog(false)}
        onConfirm={handleRestore}
        name={
          selectedEmployee
            ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
            : ""
        }
      />
    </div>
  );
}
