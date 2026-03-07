import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  UserPlus2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Inbox,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/Stats";
import { apiGet, apiPost } from "@/interceptor/interceptor";

function formatCurrency(num) {
  if (num == null || num === "") return "—";
  return new Intl.NumberFormat("en-PK", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function Report() {
  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [clientStats, setClientStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [todoStats, setTodoStats] = useState(null);
  const [milestoneStats, setMilestoneStats] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [recentLeaveRequests, setRecentLeaveRequests] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [upcomingTodos, setUpcomingTodos] = useState([]);

  useEffect(() => {
    const promises = [];

    promises.push(apiGet("employee/get-stats").then((r) => r?.stats && setEmployeeStats(r.stats)).catch(() => {}));
    promises.push(apiGet("project/get-stats").then((r) => r?.stats && setProjectStats(r.stats)).catch(() => {}));
    promises.push(apiGet("client/get-stats").then((r) => r?.stats && setClientStats(r.stats)).catch(() => {}));
    promises.push(apiGet("leave-request/get-stats").then((r) => r?.stats && setLeaveStats(r.stats)).catch(() => {}));
    promises.push(apiGet("todo/get-stats").then((r) => r?.stats && setTodoStats(r.stats)).catch(() => {}));
    promises.push(apiGet("milestone/get-stats").then((r) => r?.stats && setMilestoneStats(r.stats)).catch(() => {}));

    promises.push(
      apiGet("leave-request/get-by-filter?page=1&size=8&sort=createdAt&order=desc")
        .then((r) => setRecentLeaveRequests(r?.filteredData?.requests ?? []))
        .catch(() => {})
    );

    promises.push(
      apiPost("transaction/get-all", {})
        .then((r) => {
          if (r?.isSuccess && Array.isArray(r.transactions)) {
            const txns = r.transactions;
            const income = txns.filter((t) => t.transactionType === "income").reduce((s, t) => s + (t.amount || 0), 0);
            const expense = txns.filter((t) => t.transactionType === "expense").reduce((s, t) => s + (t.amount || 0), 0);
            setFinanceSummary({
              totalTransactions: txns.length,
              totalIncome: income,
              totalExpense: expense,
              net: income - expense,
            });
            const sorted = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentTransactions(sorted.slice(0, 8));
          }
        })
        .catch(() => {})
    );

    promises.push(
      apiGet("todo/get-all?status=upcoming")
        .then((r) => {
          const todos = r?.filteredData?.todos ?? [];
          setUpcomingTodos(todos.filter((t) => !t.isCompleted).slice(0, 6));
        })
        .catch(() => {})
    );

    Promise.allSettled(promises).then(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Reports</h1>
        <p className="text-sm mt-1 text-[var(--muted-foreground)]">
          Reports &amp; analytics — finance, employees, and activity insights.
        </p>
      </div>

      {/* Insight cards — Finance & Employees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Employees"
          value={loading ? "—" : (employeeStats?.totalEmployees ?? 0)}
          subtitle={employeeStats != null ? `${employeeStats.activeEmployees ?? 0} active` : null}
          icon={<Users size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Projects"
          value={loading ? "—" : (projectStats?.totalProjects ?? 0)}
          subtitle={projectStats != null ? `${projectStats.completedProjects ?? 0} completed` : null}
          icon={<Briefcase size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Clients"
          value={loading ? "—" : (clientStats?.totalClients ?? 0)}
          subtitle={clientStats != null ? `${clientStats.activeClients ?? 0} active` : null}
          icon={<UserPlus2 size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Income"
          value={loading ? "—" : formatCurrency(financeSummary?.totalIncome)}
          subtitle="Total income"
          icon={<TrendingUp size={20} className="text-green-600" />}
          isLoading={loading}
        />
        <StatCard
          title="Expenses"
          value={loading ? "—" : formatCurrency(financeSummary?.totalExpense)}
          subtitle="Total expenses"
          icon={<TrendingDown size={20} className="text-red-500" />}
          isLoading={loading}
        />
        <StatCard
          title="Net"
          value={loading ? "—" : formatCurrency(financeSummary?.net)}
          subtitle={financeSummary != null ? `${(financeSummary.totalTransactions || 0)} transactions` : null}
          icon={<DollarSign size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
      </div>

      {/* Second row: Leave, Todos, Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Leave requests"
          value={loading ? "—" : (leaveStats?.pendingRequests ?? 0)}
          subtitle={leaveStats != null ? `${leaveStats.approvedRequests ?? 0} approved` : null}
          icon={<Calendar size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="To-dos"
          value={loading ? "—" : (todoStats?.upcomingTodos ?? 0)}
          subtitle={todoStats != null ? `${todoStats.completedTodos ?? 0} completed` : null}
          icon={<CheckCircle size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Milestones"
          value={loading ? "—" : (milestoneStats?.delayed ?? 0)}
          subtitle={milestoneStats != null ? `${milestoneStats.completed ?? 0} completed` : null}
          icon={<AlertCircle size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
      </div>

      {/* Activity: Recent leave, Recent transactions, Upcoming todos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Recent leave activity</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Latest leave requests and status.</p>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : recentLeaveRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[var(--muted-foreground)]">
              <Inbox size={32} className="mb-2 opacity-60" />
              <p className="text-sm">No recent leave requests.</p>
              <Link to="/app/hr-management" className="text-sm text-[var(--primary)] mt-1 hover:underline">
                HR Management
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeaveRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {req.employeeId?.firstName && req.employeeId?.lastName
                        ? `${req.employeeId.firstName} ${req.employeeId.lastName}`
                        : req.employeeId?.name ?? "Employee"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {req.startDate && new Date(req.startDate).toLocaleDateString()} –{" "}
                      {req.endDate && new Date(req.endDate).toLocaleDateString()} • {req.status}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      req.status === "approved"
                        ? "bg-green-500/20 text-green-600"
                        : req.status === "pending"
                        ? "bg-amber-500/20 text-amber-600"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
              <Link to="/app/hr-management" className="text-sm text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Recent transactions</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Latest finance activity.</p>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[var(--muted-foreground)]">
              <FileText size={32} className="mb-2 opacity-60" />
              <p className="text-sm">No transactions yet.</p>
              <Link to="/app/finance" className="text-sm text-[var(--primary)] mt-1 hover:underline">
                Finance
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {t.description || (t.transactionType === "income" ? "Income" : "Expense")}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t.date ? new Date(t.date).toLocaleDateString() : ""} • {t.transactionType}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      t.transactionType === "income" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {t.transactionType === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
              <Link to="/app/finance" className="text-sm text-[var(--primary)] hover:underline">
                View Finance
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">Upcoming to-dos</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Tasks due soon.</p>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : upcomingTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[var(--muted-foreground)]">
              <CheckCircle size={32} className="mb-2 opacity-60 text-green-500" />
              <p className="text-sm">No upcoming to-dos.</p>
              <Link to="/app/my-todo-hub" className="text-sm text-[var(--primary)] mt-1 hover:underline">
                My To-Do Hub
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {upcomingTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
                >
                  <p className="text-sm font-medium text-[var(--foreground)] truncate flex-1 mr-2">{todo.title}</p>
                  <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
              <Link to="/app/my-todo-hub" className="text-sm text-[var(--primary)] hover:underline">
                View My To-Do Hub
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Report areas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/app/employees"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <Users size={16} /> Employees
          </Link>
          <Link
            to="/app/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <Briefcase size={16} /> Projects
          </Link>
          <Link
            to="/app/clients"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <UserPlus2 size={16} /> Clients
          </Link>
          <Link
            to="/app/finance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <DollarSign size={16} /> Finance
          </Link>
          <Link
            to="/app/hr-management"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <Calendar size={16} /> HR Management
          </Link>
          <Link
            to="/app/my-todo-hub"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <CheckCircle size={16} /> My To-Do Hub
          </Link>
          <Link
            to="/app/milestones"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] text-sm"
          >
            <AlertCircle size={16} /> Milestones
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Report;
