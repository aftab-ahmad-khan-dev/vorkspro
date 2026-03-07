import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  Loader2,
  Inbox,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/Stats";
import { apiGet } from "@/interceptor/interceptor";

function Performance() {
  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [milestoneStats, setMilestoneStats] = useState(null);
  const [overdueTodos, setOverdueTodos] = useState([]);
  const [recentLeaveRequests, setRecentLeaveRequests] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const promises = [];

    promises.push(
      apiGet("employee/get-stats")
        .then((r) => r?.stats && setEmployeeStats(r.stats))
        .catch(() => {})
    );
    promises.push(
      apiGet("leave-request/get-stats")
        .then((r) => r?.stats && setLeaveStats(r.stats))
        .catch(() => {})
    );
    promises.push(
      apiGet("milestone/get-stats")
        .then((r) => r?.stats && setMilestoneStats(r.stats))
        .catch(() => {})
    );
    promises.push(
      apiGet("todo/get-previous")
        .then((r) => setOverdueTodos(r?.filteredData?.todos?.slice(0, 10) ?? []))
        .catch(() => {})
    );
    promises.push(
      apiGet("leave-request/get-by-filter?page=1&size=5&sort=createdAt&order=desc")
        .then((r) => setRecentLeaveRequests(r?.filteredData?.requests ?? []))
        .catch(() => {})
    );
    promises.push(
      apiGet(`attendance/get-stats/${today}`)
        .then((r) => r?.stats && setAttendanceStats(r.stats))
        .catch(() => {})
    );

    Promise.allSettled(promises).then(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Performance
        </h1>
        <p className="text-sm mt-1 text-[var(--muted-foreground)]">
          Employee stats, leave, attendance, delayed work and platform metrics.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total Employees"
          value={loading ? "—" : (employeeStats?.totalEmployees ?? 0)}
          subtitle={employeeStats != null ? `${employeeStats.activeEmployees ?? 0} active` : null}
          icon={<Users size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="On Leave Today"
          value={loading ? "—" : (leaveStats?.onLeaveRequests ?? attendanceStats?.onLeave ?? 0)}
          subtitle="Currently on leave"
          icon={<Calendar size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Pending Leave"
          value={loading ? "—" : (leaveStats?.pendingRequests ?? 0)}
          subtitle="Awaiting approval"
          icon={<Clock size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Delayed Milestones"
          value={loading ? "—" : (milestoneStats?.delayed ?? 0)}
          subtitle={milestoneStats != null ? `${milestoneStats.inProgress ?? 0} in progress` : null}
          icon={<AlertCircle size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Overdue To-dos"
          value={loading ? "—" : overdueTodos.length}
          subtitle="Past due"
          icon={<AlertCircle size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Today Present"
          value={loading ? "—" : (attendanceStats?.presentAttendance ?? "—")}
          subtitle={attendanceStats != null ? `Absent: ${attendanceStats.absentAttendance ?? 0}` : null}
          icon={<UserCheck size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
      </div>

      {/* Leave overview */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 mb-8">
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
          Leave overview
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Recent leave requests and approvals.
        </p>
        {recentLeaveRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-[var(--muted-foreground)]">
            <Inbox size={32} className="mb-2 opacity-60" />
            <p className="text-sm">No recent leave requests.</p>
            <Link to="/hr-management" className="text-sm text-[var(--primary)] mt-1 hover:underline">
              View HR Management
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
                    {req.employeeId?.name ?? "Employee"}
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
            <Link to="/hr-management" className="text-sm text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
        )}
      </div>

      {/* Delayed work & overdue to-dos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
            Milestone status
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Work progress and delays.
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]">Total</span>
                <span className="font-semibold text-[var(--foreground)]">{milestoneStats?.totalMilestones ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]">Completed</span>
                <span className="font-semibold text-green-600">{milestoneStats?.completed ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]">In progress</span>
                <span className="font-semibold text-blue-500">{milestoneStats?.inProgress ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--foreground)]">Delayed</span>
                <span className="font-semibold text-red-500">{milestoneStats?.delayed ?? 0}</span>
              </div>
            </div>
          )}
          <Link to="/milestones" className="inline-block mt-4 text-sm text-[var(--primary)] hover:underline">
            View Milestones
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
            Overdue to-dos
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Tasks past due date.
          </p>
          {overdueTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[var(--muted-foreground)]">
              <CheckCircle size={32} className="mb-2 opacity-60 text-green-500" />
              <p className="text-sm">No overdue to-dos.</p>
              <Link to="/my-todo-hub" className="text-sm text-[var(--primary)] mt-1 hover:underline">
                View My To-Do Hub
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {overdueTodos.map((todo) => (
                <div
                  key={todo._id}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-b-0"
                >
                  <p className="text-sm font-medium text-[var(--foreground)] truncate flex-1 mr-2">
                    {todo.title}
                  </p>
                  <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/my-todo-hub" className="inline-block mt-4 text-sm text-[var(--primary)] hover:underline">
            View My To-Do Hub
          </Link>
        </div>
      </div>

      {/* Today's attendance snapshot */}
      {attendanceStats != null && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-1">
            Today&apos;s attendance
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Present, absent, on leave and late arrivals.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-[var(--border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{attendanceStats.presentAttendance ?? 0}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Present</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{attendanceStats.absentAttendance ?? 0}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Absent</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{attendanceStats.onLeave ?? 0}</p>
              <p className="text-xs text-[var(--muted-foreground)]">On leave</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">{attendanceStats.lateArrival ?? 0}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Late arrival</p>
            </div>
          </div>
          <Link to="/attendance" className="inline-block mt-4 text-sm text-[var(--primary)] hover:underline">
            View Attendance
          </Link>
        </div>
      )}
    </div>
  );
}

export default Performance;
