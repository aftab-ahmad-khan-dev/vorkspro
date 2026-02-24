import { Users, FolderKanban, DollarSign, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label,text }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-background backdrop-blur px-4 py-3 shadow-lg">
      <p className=" text-foreground">{label}</p>
      <p className="text-base mt-2 font-semibold text-violet-500">
        {text} {payload[0].value}
      </p>
    </div>
  );
};

export default function Dashboard() {
  const revenueData = [
    { month: "Jul", value: 85000 },
    { month: "Aug", value: 92000 },
    { month: "Sep", value: 78000 },
    { month: "Oct", value: 105000 },
    { month: "Nov", value: 98000 },
    { month: "Dec", value: 120000 },
    { month: "Jan", value: 95000 },
  ];

  const data = [
    { name: "Phoenix", progress: 70 },
    { name: "Dashboard", progress: 45 },
    { name: "API", progress: 60 },
    { name: "Mobile MVP", progress: 35 },
  ];

  return (
    <div className="min-h-screen bg-background sm:p-8">
      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-border/50 rounded-xl p-6 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Employees</p>
            <p className="text-2xl font-bold my-2 text-foreground">5</p>
            <p className="text-xs text-emerald-400 mt-1">
              +8% <span className="text-muted-foreground">vs last month</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-400 flex items-center justify-center h-12 w-12 text-white rounded-lg">
            <Users />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-border/50 rounded-xl p-6 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="text-2xl font-bold my-2 text-foreground">3</p>
            <p className="text-xs text-emerald-400 mt-1">
              +12% <span className="text-muted-foreground">vs last month</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600  to-cyan-400 flex items-center justify-center h-12 w-12 text-white rounded-lg">
            <FolderKanban />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-border/50 rounded-xl p-6 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold my-2 text-foreground">$40K</p>
            <p className="text-xs text-emerald-400 mt-1">
              +15% <span className="text-muted-foreground">vs last month</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center h-12 w-12 text-white rounded-lg">
            <DollarSign />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-border/50 rounded-xl p-6 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Open Blockers</p>
            <p className="text-2xl font-bold my-2 text-foreground">2</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center h-12 w-12 text-white rounded-lg">
            <AlertTriangle />
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className=" bg-border/50 rounded-xl p-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg text-foreground font-bold">Revenue Trend</h3>
            <span className="text-xs items-center bg-green-500/20 font-bold text-green-400 px-3 py-2 rounded-full">
              +15% this month
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip text={"revenue:"} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: "#8B5CF6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-border/50 rounded-xl p-6">
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Project Progress
            </h3>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-4 font-semibold py-2 rounded-full">
              3 Active
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                {/* X axis becomes numeric */}
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(v) => `${v}%`}
                />

                {/* Y axis becomes category */}
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={17}
                  width={100}
                />

                <Tooltip
                  
                  content={<CustomTooltip text={"progress:"} />}
                />

                <Bar
                  dataKey="progress"
                  radius={[0, 6, 6, 0]} // rounded right side
                  fill="#8b5cf6"
                  activeBar={{
                    fill: "#a78bfa", // hover color
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="bg-border/50 rounded-xl p-6">
          <h3 className="text-lg text-foreground font-semibold mb-4">Pending Actions</h3>

          <div className="flex justify-between items-center bg-yellow-400/5 rounded-lg p-4 mb-3">
            <div>
              <p className="font-semibold text-sm text-yellow-600 dark:text-yellow-400">Leave Requests</p>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 font-bold">1</span>
          </div>

          <div className="flex justify-between items-center bg-red-400/5 rounded-lg p-4">
            <div>
              <p className="font-semibold text-sm text-red-400">Open Blockers</p>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </div>
            <span className="text-red-400 font-bold">2</span>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-border/50 rounded-xl p-6">
          <h3 className="text-lg text-foreground font-semibold mb-4">Financial Overview</h3>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Cash Inflow</span>
              <span className="font-semibold text-green-400">$40,000</span>
            </div>
            <div className="h-2 bg-border rounded-full">
              <div className="h-2 bg-emerald-500 rounded-full w-[67%]" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Cash Outflow</span>
              <span className="text-red-400 font-semibold">$52,500</span>
            </div>
            <div className="h-2 bg-border rounded-full">
              <div className="h-2 bg-gradient-to-r from-red-500 to bg-orange-500 rounded-full w-[88%]" />
            </div>
          </div>

          <div className="flex justify-between border-t border-border pt-4 font-semibold">
            <span className="text-foreground text-sm">Net Cash Flow</span>
            <span className="text-purple-400">-$12,500</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-border/50 rounded-xl p-6">
          <h3 className="text-lg text-foreground font-semibold mb-4">Quick Stats</h3>

          {[
            ["Total Employees", "6"],
            ["On Leave Today", "1"],
            ["Total Projects", "4"],
            ["Completed Projects", "0"],
          ].map((item, i) => (
            <div key={i} className="flex justify-between mb-3 text-sm">
              <span className="text-muted-foreground">{item[0]}</span>
              <span className="font-semibold text-foreground">{item[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
