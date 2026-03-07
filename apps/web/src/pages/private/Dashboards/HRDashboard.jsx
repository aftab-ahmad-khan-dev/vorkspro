import { Calendar, Clock, Users } from "lucide-react";
import React from "react";
import { DASHBOARD_SUMMARIES } from "@/config/dashboardConfig";
import {
  DashboardSummaryCard,
  DashboardInsightCard,
  DashboardQuickActions,
  DashboardActivitySection,
} from "@/components/dashboard";

export default function HRDashboard() {
  return (
    <div className="min-h-screen bg-background sm:p-6 sm:p-8">
      {/* 1. Summary — generic layout */}
      <DashboardSummaryCard title="HR dashboard" summary={DASHBOARD_SUMMARIES.hr} />

      {/* 2. Insight action cards (4 KPI) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <DashboardInsightCard
          title="Active Employees"
          value="5"
          subtitle="↑ 8% vs last month"
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500"
        />
        <DashboardInsightCard
          title="Present Today"
          value="2"
          icon={<Clock className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-green-500 to-emerald-400"
        />
        <DashboardInsightCard
          title="Pending Leave Requests"
          value="1"
          icon={<Calendar className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-orange-500 to-amber-400"
        />
        <DashboardInsightCard
          title="Late Arrivals Today"
          value="1"
          icon={<Clock className="w-6 h-6" />}
          iconBg="bg-gradient-to-br from-rose-500 to-pink-500"
        />
      </div>

      {/* 3. Quick Actions — generic, dynamic by role */}
      <DashboardQuickActions />

      {/* 4. Activity related to department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DashboardActivitySection title="Upcoming Birthdays" subtitle="">
          <p className="text-muted-foreground text-sm">No birthdays in the next 7 days</p>
        </DashboardActivitySection>

        <DashboardActivitySection title="Work Anniversaries This Month" subtitle="">

          <div
  className="
    flex flex-col gap-3
    sm:flex-row sm:items-center sm:justify-between
    dark:bg-border/30 bg-border rounded-lg p-4
  "
>
  {/* Left section */}
  <div className="flex items-center gap-3 min-w-0">
    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shrink-0">
      D
    </div>

    <div className="min-w-0">
      <p className="font-medium text-foreground truncate">
        David Martinez
      </p>
      <p className="text-sm text-muted-foreground">
        January 10
      </p>
    </div>
  </div>

  {/* Right badge */}
  <span
    className="
      self-start sm:self-auto
      text-sm bg-blue-500/20 text-blue-500
      px-3 py-1 rounded-full
    "
  >
    3 years
  </span>
</div>
        </DashboardActivitySection>
      </div>

      {/* Activity: Pending Leave Requests */}
      <DashboardActivitySection title="Pending Leave Requests" subtitle="Latest requests awaiting approval" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2">Employee</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Duration</th>
                <th className="text-left py-2">Reason</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-4 text-muted-foreground">Michael Chen</td>
                <td>
                  <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-xs">
                    vacation
                  </span>
                </td>
                <td className="text-muted-foreground">2/10/2026 - 2/14/2026</td>
                <td className="text-muted-foreground">Family vacation</td>
                <td className="flex gap-2 py-4">
                  <button className="bg-green-500/20 text-green-500 px-4 py-1 rounded-lg text-sm">
                    Approve
                  </button>
                  <button className="bg-red-500/20 text-red-500 px-4 py-1 rounded-lg text-sm">
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardActivitySection>

      {/* Activity: Today's Attendance */}
      <DashboardActivitySection title="Today's Attendance" subtitle="" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <AttendanceCard title="Present" value="2" bg="bg-green-500/10" text="text-green-500" />
          <AttendanceCard title="Late" value="1" bg="bg-yellow-500/10" text="text-yellow-700 dark:text-yellow-500" />
          <AttendanceCard title="On Leave" value="1" bg="bg-blue-500/10" text="text-blue-500" />
          <AttendanceCard title="Absent" value="0" bg="bg-red-500/10" text="text-red-500" />
        </div>
      </DashboardActivitySection>
    </div>
  );
}

function AttendanceCard({ title, value, bg, text }) {
  return (
    <div className={`${bg} rounded-xl p-6`}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl ${text} font-bold mt-2`}>{value}</p>
    </div>
  );
}
