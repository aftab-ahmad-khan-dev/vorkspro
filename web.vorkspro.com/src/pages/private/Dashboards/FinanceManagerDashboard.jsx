import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* -------------------- Data -------------------- */

const cashFlowData = [
  { month: "Aug", inflow: 90000, outflow: 50000 },
  { month: "Sep", inflow: 75000, outflow: 50000 },
  { month: "Oct", inflow: 105000, outflow: 50000 },
  { month: "Nov", inflow: 95000, outflow: 50000 },
  { month: "Dec", inflow: 115000, outflow: 50000 },
  { month: "Jan", inflow: 40000, outflow: 50000 },
];

const expenseData = [
  { name: "Salary", value: 86, color: "#8b5cf6" },
  { name: "Rent", value: 10, color: "#3b82f6" },
  { name: "Tools", value: 5, color: "#10b981" },
];

/* -------------------- Tooltip -------------------- */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg  bg-background px-4 py-3 shadow-lg">
      <p className="text-sm text-foreground font-bold">{label}</p>
      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="mt-1 text-sm font-semibold"
          style={{ color: item.fill }}
        >
          {item.dataKey}: ${item.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

/* -------------------- Dashboard -------------------- */

export default function FinanceManagerDashboard() {
  return (
    <div className="min-h-screen bg-background sm:p-6 text-foreground">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard
          title="Total Inflow"
          value="$40K"
          change="+15% vs last month"
          icon={<TrendingUp />}
          color="bg-gradient-to-br from-emerald-500 to-green-400"
          text="text-green-500"
        />

        <StatCard
          title="Total Outflow"
          value="$53K"
          change="-5% vs last month"
          icon={<TrendingDown />}
          color="bg-gradient-to-br from-orange-700 to-orange-500"
          text="text-orange-500"
        />

        <StatCard
          title="Net Cash Flow"
          value="$-13K"
          change="+22% vs last month"
          icon={<DollarSign />}
          color="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500"
          text="text-violet-500"
        />

        <StatCard
          title="Pending Payments"
          value="$55K"
          icon={<CreditCard />}
          color="bg-gradient-to-br from-yellow-400 to-amber-600"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card className="bg-border/50 border-none">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold">6-Month Cash Flow</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="inflow" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="outflow" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        {/* Pie Chart */}
        <Card className="bg-border/50 border-none">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Expense Breakdown
            </h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    labelLine={false}
                    label={({ name, percent, fill }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  {/* Optional: remove if you don’t want hover info */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "background",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className=" mt-6 bg-background  text-muted-foreground">
      {/* Recent Transactions */}
      <div className="mb-6 rounded-xl bg-border/50 p-6 ">
        <h2 className="mb-4 text-xl text-foreground font-semibold">Recent Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-muted-foreground/50 text-foreground/80">
              <tr>
                <th className="py-3 text-left font-medium">Date</th>
                <th className="py-3 text-left font-medium">Description</th>
                <th className="py-3 text-left font-medium">Category</th>
                <th className="py-3 text-left font-medium">Amount</th>
                <th className="py-3 text-left font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted-foreground/50 ">
              <tr>
                <td className="py-4">1/20/2026</td>
                <td className="text-foreground">Innovate Solutions - Dashboard Design</td>
                <td className="text-foreground text-sm font-semibold">client payment</td>
                <td className="font-medium text-green-400">+$15,000</td>
                <td>
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-500">
                    inflow
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">1/15/2026</td>
                <td className="text-foreground">TechCorp Inc. - Project Phoenix Milestone</td>
                <td className="text-foreground text-sm font-semibold">client payment</td>
                <td className="font-medium text-green-400">+$25,000</td>
                <td>
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-500">
                    inflow
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">1/10/2026</td>
                <td className="text-foreground">Software licenses and subscriptions</td>
                <td className="text-foreground text-sm font-semibold">tools</td>
                <td className="font-medium text-red-400">-$2,500</td>
                <td>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-500">
                    outflow
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">1/1/2026</td>
                <td className="text-foreground">January Salaries</td>
                <td className="text-foreground text-sm font-semibold">salary</td>
                <td className="font-medium text-red-400">-$45,000</td>
                <td>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-500">
                    outflow
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4">1/1/2026</td>
                <td className="text-foreground">Office Rent - January</td>
                <td className="text-foreground text-sm font-semibold">rent</td>
                <td className="font-medium text-red-400">-$5,000</td>
                <td>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-500">
                    outflow
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Status */}
      <div className="rounded-xl bg-border/50 p-6 ">
        <h2 className="mb-4 text-xl text-foreground font-semibold">Payment Status</h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Paid */}
          <div className="rounded-xl border border-green-500 bg-green-500/10 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">TechCorp Inc.</h3>
              <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs dark:text-green-400 text-green-700">
                paid
              </span>
            </div>
            <p className="mt-1 text-xs ">INV-2026-001</p>
            <p className="mt-4 text-2xl font-bold text-foreground">$25,000</p>
            <p className="mt-1 text-xs ">1/15/2026</p>
          </div>

          {/* Paid */}
          <div className="rounded-xl border border-green-500 bg-green-500/10 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Innovate Solutions</h3>
              <span className="rounded-full bg-green-600/20 px-3 py-1 text-xs dark:text-green-400 text-green-700">
                paid
              </span>
            </div>
            <p className="mt-1 text-xs ">INV-2026-002</p>
            <p className="mt-4 text-2xl font-bold text-foreground">$15,000</p>
            <p className="mt-1 text-xs ">1/20/2026</p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-yellow-500 bg-yellow-500/20 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Global Enterprises</h3>
              <span className="rounded-full bg-yellow-600/20 px-3 py-1 text-xs dark:text-yellow-400 text-yellow-800">
                pending
              </span>
            </div>
            <p className="mt-1 text-xs ">INV-2026-003</p>
            <p className="mt-4 text-2xl font-bold text-foreground">$35,000</p>
            <p className="mt-1 text-xs ">1/25/2026</p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-yellow-500 bg-yellow-500/20 p-5 md:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">TechCorp Inc.</h3>
              <span className="rounded-full bg-yellow-600/20 px-3 py-1 text-xs dark:text-yellow-400 text-yellow-800">
                pending
              </span>
            </div>
            <p className="mt-1 text-xs ">INV-2026-004</p>
            <p className="mt-4 text-2xl font-bold text-foreground">$20,000</p>
            <p className="mt-1 text-xs ">2/5/2026</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

/* -------------------- Stat Card -------------------- */

function StatCard({ title, value, change, icon, color, text }) {
  return (
    <Card className="bg-border/50 border-none">
      <CardContent className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && <p className={`text-sm ${text}`}>{change}</p>}
        </div>
        <div className={`rounded-lg p-3 text-white ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
