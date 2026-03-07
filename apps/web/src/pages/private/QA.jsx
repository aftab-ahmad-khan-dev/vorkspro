import React from "react";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function QA() {
  const qaStats = [
    {
      title: "Total Bugs",
      value: "156",
      subtitle: "All time",
      color: "text-[var(--foreground)]",
    },
    {
      title: "Open Issues",
      value: "23",
      subtitle: "Needs attention",
      color: "text-red-600",
    },
    {
      title: "In Progress",
      value: "15",
      subtitle: "Being fixed",
      color: "text-blue-600",
    },
    {
      title: "Resolved",
      value: "118",
      subtitle: "Fixed & verified",
      color: "text-green-600",
    },
  ];

  const recentBugs = [
    {
      id: "#1",
      title: "Login page not responsive on mobile",
      project: "E-commerce Platform",
      severity: "high",
      status: "Open",
      assignee: "Emma Wilson",
      reported: "2025-10-10",
    },
    {
      id: "#2",
      title: "Payment gateway timeout error",
      project: "E-commerce Platform",
      severity: "critical",
      status: "In-Progress",
      assignee: "Sarah Johnson",
      reported: "2025-10-09",
    },
    {
      id: "#3",
      title: "Dashboard charts not loading",
      project: "CRM System",
      severity: "medium",
      status: "Open",
      assignee: "Mike Chen",
      reported: "2025-10-08",
    },
    {
      id: "#4",
      title: "Email notifications delayed",
      project: "Mobile App",
      severity: "low",
      status: "Resolved",
      assignee: "John Davis",
      reported: "2025-10-05",
    },
    {
      id: "#5",
      title: "Search function returns incorrect results",
      project: "CRM System",
      severity: "high",
      status: "In-Progress",
      assignee: "Sarah Johnson",
      reported: "2025-10-07",
    },
  ];

  const bugTrackingData = [
    { week: "Week 1", reported: 35, resolved: 28, pending: 7 },
    { week: "Week 2", reported: 40, resolved: 32, pending: 8 },
    { week: "Week 3", reported: 30, resolved: 26, pending: 4 },
    { week: "Week 4", reported: 45, resolved: 36, pending: 9 },
  ];

  return (
    <div className="min-h-screen p-8 w-full text-[var(--foreground)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            QA & Testing Dashboard
          </h1>
          <p className="mt-1">Track bugs, issues, and quality metrics</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
          <Plus size={18} /> Report Bug
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {qaStats.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg p-6 border border-[var(--border)]  "
          >
            <h3 className="text-sm font-medium mb-2">{item.title}</h3>
            <p
              className={`text-3xl font-bold ${
                item.color ?? "text-[var(--foreground)]"
              }`}
            >
              {item.value}
            </p>
            <p className="text-sm">{item.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Bug Tracking Chart */}
      <div className="rounded-lg border border-[var(--border)]   p-6 mb-8 ">
        <h3 className="text-lg font-bold mb-4 text-[var(--foreground)]">
          Bug Tracking – Last 4 Weeks
        </h3>
        <p className="text-sm mb-4 text-gray-500">
          Weekly bug reports and resolutions
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bugTrackingData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="week"
                stroke="var(--foreground)"
                className="text-[var(--foreground)]"
              />
              <YAxis stroke="var(--foreground)" />

              <Tooltip
                cursor={{ fill: "var(--background)" }}
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                  boxShadow: "0 4px 16px var(--background)",
                }}
                labelStyle={{
                  fontWeight: "600",
                  color: "hsl(var(--foreground))",
                }}
                itemStyle={{
                  color: "hsl(var(--primary))",
                }}
                formatter={(value, name) => {
                  const color =
                    name === "Reported"
                      ? "#ef4444"
                      : name === "Resolved"
                      ? "#22c55e"
                      :name === "Pending"
                      ? "#eab308"
                      :"hsl(var(--foreground))";

                  return [
                    <span style={{ color, fontWeight: 600 }}>
                      ${value.toLocaleString()}
                    </span>,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ];
                }}
              />

              <Legend />

              <Bar
                dataKey="reported"
                name="Reported"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                activeBar={{ fill: "#f87171" }}
              />
              <Bar
                dataKey="resolved"
                name="Resolved"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
                activeBar={{ fill: "#4ade80" }}
              />
              <Bar
                dataKey="pending"
                name="Pending"
                fill="#eab308"
                radius={[6, 6, 0, 0]}
                activeBar={{ fill: "#fde047" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Bug Reports */}
      <div className="p-0 border border-[var(--border)] rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Bug ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">
                  Reported
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-[var(--card-foreground)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBugs.map((bug, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300"
                >
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {bug.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {bug.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {bug.project}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        bug.severity === "high"
                          ? "bg-red-500"
                          : bug.severity === "critical"
                          ? "bg-red-700"
                          : bug.severity === "medium"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {bug.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bug.status === "Open"
                          ? "bg-orange-100 text-orange-800"
                          : bug.status === "In-Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {bug.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {bug.assignee}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                    {bug.reported}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0 justify-center">
                      <Button
                        className="text-[var(--button)] bg-transparent hover:bg-[var(--button)]/20"
                        size="sm"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentBugs.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[var(--muted-foreground)] text-lg">
              No bug reports found.
            </p>
            <p className="text-[var(--muted-foreground)] mt-2">
              Try adjusting your search or filter to find matching bug reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QA;
