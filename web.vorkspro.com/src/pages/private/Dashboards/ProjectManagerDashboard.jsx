import React from "react";
import { FolderKanban, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { DASHBOARD_SUMMARIES } from "@/config/dashboardConfig";
import {
  DashboardSummaryCard,
  DashboardInsightCard,
  DashboardQuickActions,
  DashboardActivitySection,
} from "@/components/dashboard";

const ProjectCard = ({
  title,
  client,
  progress,
  team,
  budget,
  due,
  highlight = false,
}) => (
  <div
    className={`rounded-xl border-[1px] hover:border-purple-500/50 border-muted-foreground/20 bg bg-border/50 dark:bg-border/40 p-6 transition `}
  >
    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{client}</p>
      </div>
      <span className="rounded-full  px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-400">
        {progress}%
      </span>
    </div>

    {/* Progress Bar */}
    <div className="mt-4 h-2 w-full rounded-full bg-muted-foreground/20">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
        style={{ width: `${progress}%` }}
      />
    </div>

    {/* Meta */}
    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex gap-5">
        <p>
          Team: <span className="text-foreground">{team} members</span>
        </p>
        <p>
          Budget:{" "}
          <span className="text-foreground">${budget.toLocaleString()}</span>
        </p>
      </div>
      <p>
        Due: <span className="text-foreground">{due}</span>
      </p>
    </div>
  </div>
);

export default function ProjectManagerDashboard() {
  return (
    <div className="min-h-screen bg-background sm:p-8">
<DashboardSummaryCard title="Project manager dashboard" summary={DASHBOARD_SUMMARIES.projectManager} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardInsightCard title="Active Projects" value="3" subtitle="↑ 12% vs last month" Icon={FolderKanban} iconBg="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500" />
        <DashboardInsightCard title="Open Blockers" value="2" Icon={AlertTriangle} iconBg="bg-gradient-to-br from-orange-700 via-orange-600 to-orange-500" />
        <DashboardInsightCard title="Completed Milestones" value="1" subtitle="↑ 23% vs last month" Icon={CheckCircle} iconBg="bg-gradient-to-br from-green-500 to-emerald-400" />
        <DashboardInsightCard title="Pending Follow-ups" value="1" Icon={Clock} iconBg="bg-gradient-to-br from-yellow-400 to-amber-600" />
      </div>

      {/* Quick Actions — dynamic: only modules assigned to your role by admin */}
      <DashboardQuickActions className="mb-8" />

      <DashboardActivitySection title="Active Projects" subtitle="" className="mt-6">
        <div className="space-y-6">
          <ProjectCard
            title="Project Phoenix"
            client="TechCorp Inc."
            progress={65}
            team={3}
            budget={85000}
            due="3/31/2026"
          />

          <ProjectCard
            title="Client Dashboard Redesign"
            client="Innovate Solutions"
            progress={40}
            team={2}
            budget={35000}
            due="2/28/2026"
          />

          <ProjectCard
            title="API Integration Suite"
            client="Global Enterprises"
            progress={55}
            team={2}
            budget={95000}
            due="4/30/2026"
            highlight
          />
        </div>
      </DashboardActivitySection>

      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardActivitySection title="Upcoming Milestones" subtitle="">
            <div className="space-y-4">
              {[
                {
                  title: "Authentication Flow",
                  subtitle: "API Integration Suite",
                  due: "Due: 1/28/2026",
                  status: "in progress",
                },
                {
                  title: "Database Migration",
                  subtitle: "Project Phoenix",
                  due: "Due: 1/30/2026",
                  status: "in progress",
                },
                {
                  title: "Component Library",
                  subtitle: "Client Dashboard Redesign",
                  due: "Due: 2/10/2026",
                  status: "in progress",
                },
                {
                  title: "API Development",
                  subtitle: "Project Phoenix",
                  due: "Due: 2/15/2026",
                  status: "blocked",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="
    flex flex-col gap-3
    sm:flex-row sm:items-center sm:justify-between
    bg-border/70 rounded-xl p-4
  "
                >
                  {/* Left content */}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>

                    <p className="text-sm text-muted-foreground truncate">
                      {item.subtitle}
                    </p>

                    <p className="text-xs text-foreground mt-1">{item.due}</p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`
      self-start sm:self-auto
      text-xs px-3 py-1 rounded-full capitalize font-medium
      ${
        item.status === "blocked"
          ? "bg-red-500/20 text-red-400"
          : "bg-blue-500/20 text-blue-400"
      }
    `}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </DashboardActivitySection>

          <DashboardActivitySection title="Active Blockers" subtitle="">
            <div className="space-y-4">
              {[
                {
                  title: "Project Phoenix",
                  desc: "Waiting for client API credentials",
                  owner: "Owner: James Wilson",
                  priority: "high",
                  date: "1/18/2026",
                },
                {
                  title: "Mobile App MVP",
                  desc: "Team member on medical leave",
                  owner: "Owner: James Wilson",
                  priority: "medium",
                  date: "1/20/2026",
                },
              ].map((blocker) => (
                <div
                  key={blocker.title}
                  className={`border border-red-500/40 ${
                     blocker.priority === "high"
                          ? "bg-red-500/10 border-red-500/40"
                          : "bg-yellow-500/10 border-yellow-500/40"
                  } bg-red-500/10 rounded-xl p-4`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{blocker.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {blocker.desc}
                      </p>
                      <p className="text-xs text-foreground mt-1">
                        {blocker.owner}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                        blocker.priority === "high"
                          ? "bg-red-500/30 text-red-500 dark:text-red-400"
                          : "bg-yellow-500/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {blocker.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 text-right">
                    {blocker.date}
                  </p>
                </div>
              ))}
            </div>
          </DashboardActivitySection>
        </div>
        <DashboardActivitySection title="Client Follow-ups" subtitle="" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-foreground/80 border-b border-muted-foreground/50">
                <tr>
                  <th className="text-left py-2">Client</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>

              <tbody className="">
                <tr>
                  <td className="py-3 font-medium">
                    Marcus Brown (Global Enterprises)
                  </td>
                  <td className="py-3 text-muted-foreground">
                    Follow up on project milestone approval
                  </td>
                  <td className="py-3 text-muted-foreground">1/22/2026</td>
                  <td className="py-3">
                    <span className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs px-3 py-1 rounded-full">
                      pending
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-medium">
                    Jennifer Lee (Innovate Solutions)
                  </td>
                  <td className="py-3 text-muted-foreground">
                    Discuss additional requirements
                  </td>
                  <td className="py-3 text-muted-foreground">1/20/2026</td>
                  <td className="py-3">
                    <span className="bg-green-500/20 text-green-500 text-xs px-3 py-1 rounded-full">
                      done
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DashboardActivitySection>
      </div>
    </div>
  );
}
