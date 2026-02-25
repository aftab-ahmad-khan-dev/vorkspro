import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Briefcase,
  DollarSign,
  CheckCircle,
  User2,
  FolderPlus,
  UserPlus2,
  File,
  DollarSignIcon,
  Calendar1,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalDialog from "@/models/GlobalDialog";
import { EmployeeDialog } from "@/models/dashboard/EmployeeDialog";
import { ReportDialog } from "@/models/dashboard/ReportDialog";
import { ProjectDialog } from "@/models/dashboard/ProjectDialog";
import { ClientDialog } from "@/models/dashboard/ClientDialog";
import { AnnouncementDialog } from "@/models/dashboard/AnnouncementDialog";
import { InvoiceDialog } from "@/models/dashboard/InvoiceDialog";
import StatCard from "@/components/Stats";
import { useTabs } from "@/context/TabsContext";
import { apiGet } from "@/interceptor/interceptor";
import { Link } from "react-router-dom";

function Dashboard() {
  const { tabs } = useTabs();
  const isSuperAdmin = tabs?.isSuperAdmin ?? false;
  const modulePermissions = tabs?.modulePermissions ?? [];
  const allowedModules = isSuperAdmin
    ? ["Employees", "Projects", "Client Management", "HR Management", "My To-Do Hub", "Reports & Analytics", "Finance", "Announcements"]
    : modulePermissions.map((p) => p.module);
  const hasPermission = (moduleName) => allowedModules.includes(moduleName);
  const hasAction = (moduleName, actionName) => {
    if (isSuperAdmin) return true;
    const perm = modulePermissions.find((p) => p.module === moduleName);
    return perm && Array.isArray(perm.actions) && perm.actions.includes(actionName);
  };

  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [clientStats, setClientStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [todoStats, setTodoStats] = useState(null);
  const [upcomingTodos, setUpcomingTodos] = useState([]);
  const [recentLeaveRequests, setRecentLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const promises = [];

      if (hasPermission("Employees")) promises.push(apiGet("employee/get-stats").then((r) => r?.stats && setEmployeeStats(r.stats)).catch(() => {}));
      if (hasPermission("Projects")) promises.push(apiGet("project/get-stats").then((r) => r?.stats && setProjectStats(r.stats)).catch(() => {}));
      if (hasPermission("Client Management")) promises.push(apiGet("client/get-stats").then((r) => r?.stats && setClientStats(r.stats)).catch(() => {}));
      if (hasPermission("HR Management")) promises.push(
        apiGet("leave-request/get-stats").then((r) => r?.stats && setLeaveStats(r.stats)).catch(() => {}),
        apiGet("leave-request/get-by-filter?page=1&size=5&sort=createdAt&order=desc").then((r) => setRecentLeaveRequests(r?.filteredData?.requests ?? [])).catch(() => {})
      );
      if (hasPermission("My To-Do Hub")) {
        promises.push(apiGet("todo/get-stats").then((r) => r?.stats && setTodoStats(r.stats)).catch(() => {}));
        promises.push(apiGet("todo/get-all?status=upcoming").then((r) => {
          const todos = r?.filteredData?.todos ?? [];
          setUpcomingTodos(todos.filter((t) => !t.isCompleted).slice(0, 5));
        }).catch(() => {}));
      }

      await Promise.allSettled(promises);
      setLoading(false);
    };
    fetchDashboardData();
  }, [tabs?.modulePermissions?.length, isSuperAdmin]);

  const projectStatusData = useMemo(() => {
    if (!projectStats) return [];
    const { inProgressProjects = 0, completedProjects = 0, onHoldProjects = 0, notstartedProjects = 0, cancelledProjects = 0 } = projectStats;
    return [
      { name: "Completed", value: completedProjects, color: "#34d399" },
      { name: "In Progress", value: inProgressProjects, color: "#60a5fa" },
      { name: "Not Started", value: notstartedProjects, color: "#94a3b8" },
      { name: "On Hold", value: onHoldProjects, color: "#fbbf24" },
      { name: "Cancelled", value: cancelledProjects, color: "#f87171" },
    ].filter((d) => d.value > 0);
  }, [projectStats]);

  const revenueExpensesData = [
    { month: "Jan", Revenue: 350, Expenses: 280 },
    { month: "Feb", Revenue: 380, Expenses: 290 },
    { month: "Mar", Revenue: 420, Expenses: 300 },
    { month: "Apr", Revenue: 380, Expenses: 290 },
    { month: "May", Revenue: 450, Expenses: 310 },
    { month: "Jun", Revenue: 400, Expenses: 300 },
  ];

  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [openGenerateReportDialog, setOpenGenerateReportDialog] =
    useState(false);
  const [openCreateInvoiceDialog, setOpenCreateInvoiceDialog] = useState(false);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);

  const quickActions = [
    { label: "Add Employee", icon: <User2 strokeWidth={2.5} />, module: "Employees", action: "Create Records" },
    { label: "Create Project", icon: <FolderPlus strokeWidth={2.5} />, module: "Projects", action: "Create Records" },
    { label: "Add Client", icon: <UserPlus2 strokeWidth={2.5} />, module: "Client Management", action: "Create Records" },
    { label: "Generate Report", icon: <File strokeWidth={2.5} />, module: "Reports & Analytics", action: "Export Data" },
    { label: "Create Invoice", icon: <DollarSignIcon strokeWidth={2.5} />, module: "Finance", action: "View Finance" },
    { label: "Add Announcement", icon: <Calendar1 strokeWidth={2.5} />, module: "Announcements", action: "Create Records" },
  ].filter((a) => hasPermission(a.module) && hasAction(a.module, a.action));

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const mins = Math.floor((now - d) / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const formatDaysUntil = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const days = Math.ceil((d - now) / (24 * 60 * 60 * 1000));
    if (days <= 0) return "Today";
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500";
      case "medium":
        return "bg-blue-600/20 text-blue-500";
      case "low":
        return "bg-gray-500/20 text-[var(--mute-button-text)]";
      default:
        return "bg-gray-400/20 text-[var(--mute-button-text)]";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return priority;
    }
  };

  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
<div className="min-h-screen w-full pb-8">
  {/* Page header — theme-aware */}
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
      <p className="text-sm mt-1 text-[var(--muted-foreground)]">Welcome back! Here&apos;s what&apos;s happening today.</p>
    </div>
  </div>

  {/* Real-time stats — only for modules the logged-in role can access */}
  {(hasPermission("Employees") || hasPermission("Projects") || hasPermission("Client Management") || hasPermission("HR Management") || hasPermission("My To-Do Hub")) && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {hasPermission("Employees") && (
        <StatCard title="Total Employees" value={loading ? "—" : (employeeStats?.totalEmployees ?? 0)} subtitle={employeeStats != null ? `${employeeStats.activeEmployees ?? 0} active` : null} icon={<Users size={20} className="text-[var(--primary)]" />} isLoading={loading} />
      )}
      {hasPermission("Projects") && (
        <StatCard title="Projects" value={loading ? "—" : (projectStats?.totalProjects ?? 0)} subtitle={projectStats != null ? `${projectStats.inProgressProjects ?? 0} in progress` : null} icon={<Briefcase size={20} className="text-[var(--primary)]" />} isLoading={loading} />
      )}
      {hasPermission("Client Management") && (
        <StatCard title="Clients" value={loading ? "—" : (clientStats?.totalClients ?? 0)} subtitle={clientStats != null ? `${clientStats.activeClients ?? 0} active` : null} icon={<UserPlus2 size={20} className="text-[var(--primary)]" />} isLoading={loading} />
      )}
      {hasPermission("HR Management") && (
        <StatCard title="Leave Requests" value={loading ? "—" : (leaveStats?.pendingRequests ?? 0)} subtitle={leaveStats != null ? `${leaveStats.approvedRequests ?? 0} approved` : null} icon={<Calendar1 size={20} className="text-[var(--primary)]" />} isLoading={loading} />
      )}
      {hasPermission("My To-Do Hub") && (
        <StatCard title="To-dos" value={loading ? "—" : (todoStats?.upcomingTodos ?? 0)} subtitle={todoStats != null ? `${todoStats.completedTodos ?? 0} completed` : null} icon={<CheckCircle size={20} className="text-[var(--primary)]" />} isLoading={loading} />
      )}
    </div>
  )}

  {hasPermission("Projects") && (
    <div className="rounded-xl p-6 border border-[var(--border)] bg-[var(--card)] mb-8">
      <h3 className="text-lg font-bold mb-1 text-[var(--foreground)]">Project Status</h3>
      <p className="text-sm mb-6 text-[var(--muted-foreground)]">Distribution by status (live)</p>
      {loading || projectStatusData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-[var(--muted-foreground)]">{loading ? <Loader2 className="w-8 h-8 animate-spin" /> : "No project data yet."}</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" activeIndex={activeIndex} onMouseEnter={onPieEnter} onMouseLeave={onPieLeave} animationDuration={400}>
                {projectStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }} formatter={(value, name, payload) => [<span key="v" style={{ color: payload?.payload?.color ?? "var(--foreground)", fontWeight: 600 }}>{Number(value).toLocaleString()}</span>, payload?.name ?? name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {projectStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--foreground)]">{item.name}</span>
                </div>
                <span className="font-semibold text-[var(--foreground)]">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )}

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    {hasPermission("HR Management") && (
      <div className="rounded-xl p-6 border border-[var(--border)] bg-[var(--card)]">
        <h3 className="text-lg font-bold mb-1 text-[var(--foreground)]">Recent Leave Activity</h3>
        <p className="text-sm mb-6 text-[var(--muted-foreground)]">Latest leave requests</p>
        {recentLeaveRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--muted-foreground)]">
            <Inbox size={32} className="mb-2 opacity-60" />
            <p className="text-sm">No recent requests</p>
            <Link to="/hr-management" className="text-sm text-[var(--primary)] mt-1 hover:underline">View HR Management</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentLeaveRequests.map((req) => (
              <div key={req._id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[var(--primary)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)]"><span className="font-semibold">{req.employeeId?.name ?? "Someone"}</span> — {req.status ?? "pending"}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatTimeAgo(req.createdAt)}</p>
                </div>
              </div>
            ))}
            <Link to="/hr-management" className="text-sm text-[var(--primary)] hover:underline">View all</Link>
          </div>
        )}
      </div>
    )}
    {hasPermission("My To-Do Hub") && (
      <div className="rounded-xl p-6 border border-[var(--border)] bg-[var(--card)]">
        <h3 className="text-lg font-bold mb-1 text-[var(--foreground)]">Upcoming Deadlines</h3>
        <p className="text-sm mb-6 text-[var(--muted-foreground)]">Your to-dos due soon</p>
        {upcomingTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--muted-foreground)]">
            <Inbox size={32} className="mb-2 opacity-60" />
            <p className="text-sm">No upcoming to-dos</p>
            <Link to="/my-todo-hub" className="text-sm text-[var(--primary)] mt-1 hover:underline">View My To-Do Hub</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTodos.map((todo) => (
              <div key={todo._id} className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)] last:border-b-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{todo.title}</p>
                  {todo.category && <p className="text-xs text-[var(--muted-foreground)]">{todo.category}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>{getPriorityLabel(todo.priority)}</span>
                  <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">{formatDaysUntil(todo.dueDate)}</span>
                </div>
              </div>
            ))}
            <Link to="/my-todo-hub" className="text-sm text-[var(--primary)] hover:underline">View all</Link>
          </div>
        )}
      </div>
    )}
  </div>

  {quickActions.length > 0 && (
    <div className="rounded-xl p-6 border border-[var(--border)] bg-[var(--card)]">
      <h3 className="text-lg font-bold mb-6 text-[var(--foreground)]">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action, idx) => (
          <Button
            key={idx}
            onClick={() => {
              if (action.label === "Add Employee") setOpenEmployeeDialog(true);
              else if (action.label === "Create Project") setOpenCreateProjectDialog(true);
              else if (action.label === "Add Client") setOpenClientDialog(true);
              else if (action.label === "Generate Report") setOpenGenerateReportDialog(true);
              else if (action.label === "Create Invoice") setOpenCreateInvoiceDialog(true);
              else if (action.label === "Add Announcement") setOpenAnnouncementDialog(true);
            }}
            className="group flex flex-col items-center justify-center gap-3 bg-[var(--background)] border-2 border-[var(--border)] hover:border-[var(--button)] rounded-xl h-32 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--button)]/20 text-[var(--button)] group-hover:bg-[var(--button)] group-hover:text-white transition-colors duration-200">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-[var(--foreground)]">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )}

  <GlobalDialog open={openEmployeeDialog} onClose={() => setOpenEmployeeDialog(false)} label="Add Employee">
    <EmployeeDialog />
  </GlobalDialog>
  <GlobalDialog open={openCreateProjectDialog} onClose={() => setOpenCreateProjectDialog(false)} label="Create Project">
    <ProjectDialog />
  </GlobalDialog>
  <GlobalDialog open={openClientDialog} onClose={() => setOpenClientDialog(false)} label="Add Client">
    <ClientDialog />
  </GlobalDialog>
  <GlobalDialog open={openGenerateReportDialog} onClose={() => setOpenGenerateReportDialog(false)} label="Generate Report">
    <ReportDialog />
  </GlobalDialog>
  <GlobalDialog open={openCreateInvoiceDialog} onClose={() => setOpenCreateInvoiceDialog(false)} label="Create Invoice">
    <InvoiceDialog />
  </GlobalDialog>
  <GlobalDialog open={openAnnouncementDialog} onClose={() => setOpenAnnouncementDialog(false)} label="Add Announcement">
    <AnnouncementDialog />
  </GlobalDialog>
</div>
  );
}

export default Dashboard;
