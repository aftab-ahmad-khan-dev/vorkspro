import { Calendar, Clock, User, User2, Users } from "lucide-react";
import React from "react";

export default function HRDashboard() {
  return (
    <div className="min-h-screen bg-background sm:p-6 text-white">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Active Employees"
          value="5"
          subtitle="↑ 8% vs last month"
          color="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500"
          Icon={Users}
        />
        <StatCard
          title="Present Today"
          value="2"
          color="bg-gradient-to-br from-green-500 to-emerald-400"
          Icon={Clock}
        />
        <StatCard
          title="Pending Leave Requests"
          value="1"
          color="bg-gradient-to-br from-orange-500 to-amber-400"
          Icon={Calendar}
        />
        <StatCard
          title="Late Arrivals Today"
          value="1"
          color="bg-gradient-to-br from-rose-500 to-pink-500"
          Icon={Clock}
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Birthdays */}
        <div className="bg-border/50 rounded-xl p-6">
          <h2 className="text-lg text-foreground font-semibold mb-4">
            Upcoming Birthdays
          </h2>
          <p className="text-muted-foreground text-sm">
            No birthdays in the next 7 days
          </p>
        </div>

        {/* Work Anniversaries */}
        <div className="bg-border/50 rounded-xl p-6">
          <h2 className="text-lg text-foreground font-semibold mb-4">
            Work Anniversaries This Month
          </h2>

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

        </div>
      </div>

      {/* Pending Leave Requests */}
      <div className="bg-border/50 rounded-xl p-6 mt-6">
        <h2 className="text-lg text-foreground font-semibold mb-4">
          Pending Leave Requests
        </h2>

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
      </div>

      {/* Today's Attendance */}
      <div className="bg-border/50 p-8 rounded-lg mt-6">
        <p className="text-foreground font-semibold text-2xl">Today's Attendance</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-5 ">
          <AttendanceCard title="Present" value="2" bg="bg-green-500/10" text="text-green-500" />
          <AttendanceCard title="Late" value="1" bg="bg-yellow-500/10" text="text-yellow-700 dark:text-yellow-500" />
          <AttendanceCard title="On Leave" value="1" bg="bg-blue-500/10" text="text-blue-500" />
          <AttendanceCard title="Absent" value="0" bg="bg-red-500/10" text="text-red-500" />
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */

function StatCard({ title, value, subtitle, color, Icon }) {
  return (
    <div className="bg-border/50 rounded-xl p-6 flex justify-between items-center">
      <div>
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-2xl text-foreground font-bold mt-1">{value}</p>
        {subtitle && <p className="text-green-400 text-xs mt-1">{subtitle}</p>}
      </div>
      <div
        className={`w-12 flex items-center justify-center text-white h-12 rounded-lg ${color}`}
      >
        <Icon />
      </div>
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
