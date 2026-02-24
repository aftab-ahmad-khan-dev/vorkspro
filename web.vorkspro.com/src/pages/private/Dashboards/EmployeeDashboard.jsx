import {
  Calendar,
  CheckSquare,
  Clock,
  SquareCheckBig,
  TrendingUp,
} from "lucide-react";
import React from "react";

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-background sm:p-6 ">
      {/* Top Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          title="Pending Tasks"
          value="2"
          iconBg="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500"
          Icon={SquareCheckBig}
        />
        <StatCard
          title="Completed Tasks"
          value="1"
          sub="↑ 18% vs last month"
          subColor="text-green-400"
          iconBg="bg-gradient-to-br from-green-600 to-green-400"
          Icon={TrendingUp}
        />
        <StatCard
          title="Upcoming Meetings"
          value="2"
          iconBg="bg-gradient-to-br from-sky-600 to-sky-400"
          Icon={Calendar}
        />
        <StatCard
          title="Work Hours Today"
          value="9h"
          iconBg="bg-gradient-to-br from-orange-600 to-orange-400"
          Icon={Clock}
        />
      </div>

      {/* Today's Summary */}
      <div className="mb-6 rounded-xl bg-border/50 p-6 ">
        <h2 className="mb-4 text-xl text-foreground font-semibold">
          Today's Summary
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Check-in Time"
            value="09:00"
            border="border-purple-500"
            bg="from-purple-500/10 via-purple-500/10 to-transparent"
          />
          <SummaryCard
            label="Check-out Time"
            value="18:00"
            border="border-green-500"
            bg="from-green-500/10  via-green-500/10 to-transparent"
          />
          <SummaryCard
            label="Status"
            value="Present"
            border="border-blue-500"
            bg="from-blue-500/10  via-blue-500/10 to-transparent"
          />
        </div>
      </div>

      {/* Projects & Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* My Projects */}
        <div className="rounded-xl bg-border/50 p-6 ">
          <h2 className="mb-4 text-xl text-foreground font-semibold">
            My Projects
          </h2>

          <ProjectCard
            title="Project Phoenix"
            client="TechCorp Inc."
            progress={65}
            due="3/31/2026"
          />
          <ProjectCard
            title="Client Dashboard Redesign"
            client="Innovate Solutions"
            progress={40}
            due="2/28/2026"
          />
          <ProjectCard
            title="API Integration Suite"
            client="Global Enterprises"
            progress={55}
            due="4/30/2026"
          />
        </div>

        {/* My Tasks */}
        <div className="rounded-xl bg-border/50 p-6 ">
          <h2 className="mb-4 text-xl text-foreground font-semibold">
            My Tasks
          </h2>

          <TaskCard
            title="Review project proposals"
            desc="Review and approve Q1 project proposals from team leads"
            status="pending"
            priority="high"
            due="1/22/2026"
            color="red"
          />

          <TaskCard
            title="Update client documentation"
            desc="Update API documentation for Global Enterprises"
            status="in progress"
            priority="medium"
            due="1/25/2026"
            color="yellow"
          />
        </div>
      </div>

      <div className="space-y-8 mt-6">
        {/* Upcoming Meetings */}
        <div className="rounded-2xl bg-border/50 p-6 ">
          <h2 className="text-xl font-semibold text-foreground mb-6">Upcoming Meetings</h2>

          {/* Meeting Item */}
          <div className="mb-4 rounded-xl bg-border/50 p-5">
            <div className="flex gap-6">
              {/* Date */}
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-400">Jan 22</p>
                <p className="text-xs text-muted-foreground">10:00</p>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-foreground">
                  Weekly Team Standup
                </h3>
                <p className="text-sm text-foreground/70 mt-1">
                  Project updates, blockers, and sprint planning
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Duration: 30 min &nbsp; • &nbsp; 4 attendees
                </p>
              </div>
            </div>
          </div>

          {/* Meeting Item */}
          <div className="rounded-xl bg-border/50 p-5">
            <div className="flex gap-6">
              {/* Date */}
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-400">Jan 23</p>
                <p className="text-xs text-muted-foreground">14:00</p>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-foreground">
                  Client Review – TechCorp
                </h3>
                <p className="text-sm text-foreground/70 mt-1">
                  Project Phoenix milestone review and next phase planning
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Duration: 60 min &nbsp; • &nbsp; 3 attendees
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-5">
          {/* Request Leave */}
          <button className="rounded-2xl mb-1 cursor-pointer hover:from-purple-600  hover:via-indigo-600 ease-in-out duration-500 hover:to-blue-600 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-6 text-white shadow-lg">
            <Calendar size={32} className="mb-4" />
            <h3 className="text-lg font-semibold">Request Leave</h3>
            <p className="text-sm opacity-90">Apply for time off</p>
          </button>

          {/* Mark Attendance */}
          <button className="rounded-2xl mb-1 bg-gradient-to-br cursor-pointer hover:from-green-600 hover:to-emerald-600 ease-in-out duration-500 from-green-500 to-emerald-500 p-6 text-white shadow-lg">
            <Clock size={32} className="mb-4" />
            <h3 className="text-lg font-semibold">Mark Attendance</h3>
            <p className="text-sm opacity-90">Check in/out</p>
          </button>

          {/* View Tasks */}
          <button className="rounded-2xl mb-1 bg-gradient-to-br cursor-pointer hover:from-sky-600 hover:to-blue-600 ease-in-out duration-500 from-sky-500 to-blue-500 p-6 text-white shadow-lg">
            <CheckSquare size={32} className="mb-4" />
            <h3 className="text-lg font-semibold">View Tasks</h3>
            <p className="text-sm opacity-90">Manage your tasks</p>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function StatCard({ title, value, sub, subColor, iconBg, Icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-border/50 p-5 ">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl text-foreground font-bold">{value}</p>
        {sub && <p className={`mt-1 text-xs ${subColor}`}>{sub}</p>}
      </div>
      <div
        className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon className="text-white" />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, border, bg }) {
  return (
    <div className={`rounded-xl border ${border} bg-gradient-to-r ${bg} p-5`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl text-foreground font-bold">{value}</p>
    </div>
  );
}

function ProjectCard({ title, client, progress, due }) {
  return (
    <div className="mb-4 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{client}</p>
        </div>
        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-500">
          active
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded bg-border">
          <div
            className="h-2 rounded bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{progress}% Complete</span>
          <span>Due: {due}</span>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ title, desc, status, priority, due, color }) {
  const colors = {
    red: "border-red-600 bg-red-500/10 text-red-600 dark:text-red-300",
    yellow:
      "border-yellow-700 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  };

  return (
    <div className={`mb-4 rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs 
    ${
      priority === "high"
        ? "bg-red-500/40"
        : priority === "medium"
          ? "bg-yellow-600/40 "
          : "bg-black/30"
    }
  `}
        >
          {priority}
        </span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Status: {status}</span>
        <span>Due: {due}</span>
      </div>
    </div>
  );
}
