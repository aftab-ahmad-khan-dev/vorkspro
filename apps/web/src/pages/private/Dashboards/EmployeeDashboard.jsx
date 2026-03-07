import { Calendar, CheckSquare, Clock, SquareCheckBig, TrendingUp } from "lucide-react";
import React from "react";
import { DASHBOARD_SUMMARIES } from "@/config/dashboardConfig";
import {
  DashboardSummaryCard,
  DashboardInsightCard,
  DashboardQuickActions,
  DashboardActivitySection,
} from "@/components/dashboard";

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-background sm:p-6 ">
      <DashboardSummaryCard title="Your dashboard" summary={DASHBOARD_SUMMARIES.employee} />
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <DashboardInsightCard title="Pending Tasks" value="2" Icon={SquareCheckBig} iconBg="bg-[var(--primary)]" />
        <DashboardInsightCard title="Completed Tasks" value="1" subtitle="↑ 18% vs last month" Icon={TrendingUp} iconBg="bg-[var(--primary)]" />
        <DashboardInsightCard title="Upcoming Meetings" value="2" Icon={Calendar} iconBg="bg-[var(--primary)]" />
        <DashboardInsightCard title="Work Hours Today" value="9h" Icon={Clock} iconBg="bg-[var(--primary)]" />
      </div>
      <DashboardQuickActions className="mb-8" />

      <DashboardActivitySection title="Today's Summary" subtitle="">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Check-in Time"
            value="09:00"
            border="border-[var(--primary)]"
            bg="from-[var(--primary)]/10 via-[var(--primary)]/10 to-transparent"
          />
          <SummaryCard
            label="Check-out Time"
            value="18:00"
            border="border-[var(--primary)]"
            bg="from-[var(--primary)]/10 via-[var(--primary)]/10 to-transparent"
          />
          <SummaryCard
            label="Status"
            value="Present"
            border="border-[var(--primary)]"
            bg="from-[var(--primary)]/10 via-[var(--primary)]/10 to-transparent"
          />
        </div>
      </DashboardActivitySection>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardActivitySection title="My Projects" subtitle="">
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
        </DashboardActivitySection>

        <DashboardActivitySection title="My Tasks" subtitle="">
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
        </DashboardActivitySection>
      </div>

      <div className="space-y-8 mt-6">
        <DashboardActivitySection title="Upcoming Meetings" subtitle="">
          {/* Meeting Item */}
          <div className="mb-4 rounded-xl bg-border/50 p-5">
            <div className="flex gap-6">
              {/* Date */}
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--primary)]">Jan 22</p>
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
                <p className="text-sm font-semibold text-[var(--primary)]">Jan 23</p>
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
        </DashboardActivitySection>

        <DashboardActivitySection title="Quick actions" subtitle="">
        <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-5">
          <button className="rounded-2xl mb-1 cursor-pointer bg-[var(--primary)] hover:opacity-90 transition-opacity p-6 text-white shadow-lg">
            <Calendar size={32} className="mb-4 mx-auto" />
            <h3 className="text-lg font-semibold">Request Leave</h3>
            <p className="text-sm opacity-90">Apply for time off</p>
          </button>
          <button className="rounded-2xl mb-1 cursor-pointer bg-[var(--primary)] hover:opacity-90 transition-opacity p-6 text-white shadow-lg">
            <Clock size={32} className="mb-4 mx-auto" />
            <h3 className="text-lg font-semibold">Mark Attendance</h3>
            <p className="text-sm opacity-90">Check in/out</p>
          </button>
          <button className="rounded-2xl mb-1 cursor-pointer bg-[var(--primary)] hover:opacity-90 transition-opacity p-6 text-white shadow-lg">
            <CheckSquare size={32} className="mb-4 mx-auto" />
            <h3 className="text-lg font-semibold">View Tasks</h3>
            <p className="text-sm opacity-90">Manage your tasks</p>
          </button>
        </div>
        </DashboardActivitySection>
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
        <span className="rounded-full bg-[var(--primary)]/20 px-3 py-1 text-xs text-[var(--primary)]">
          active
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded bg-border">
          <div
            className="h-2 rounded bg-[var(--primary)]"
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
