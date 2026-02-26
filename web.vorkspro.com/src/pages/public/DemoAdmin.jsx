/**
 * Admin Demo — Interactive demo with stock data (no auth).
 */
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, FolderKanban, DollarSign, AlertTriangle, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
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

const THEME = "#251A3C";
const ACCENT = "#a89ac9";

// Stock demo data
const DEMO_EMPLOYEES = [
  { id: 1, name: "Alex Rivera", role: "Project Manager", department: "Operations", status: "Active" },
  { id: 2, name: "Jordan Lee", role: "Developer", department: "Engineering", status: "Active" },
  { id: 3, name: "Sam Chen", role: "HR Manager", department: "People", status: "Active" },
  { id: 4, name: "Morgan Taylor", role: "Finance Analyst", department: "Finance", status: "On Leave" },
  { id: 5, name: "Casey Kim", role: "Designer", department: "Design", status: "Active" },
];

const DEMO_PROJECTS = [
  { id: 1, name: "Phoenix", progress: 70, status: "In progress" },
  { id: 2, name: "Dashboard", progress: 45, status: "In progress" },
  { id: 3, name: "API", progress: 60, status: "In progress" },
  { id: 4, name: "Mobile MVP", progress: 35, status: "Planning" },
];

const REVENUE_DATA = [
  { month: "Jul", value: 85000 },
  { month: "Aug", value: 92000 },
  { month: "Sep", value: 78000 },
  { month: "Oct", value: 105000 },
  { month: "Nov", value: 98000 },
  { month: "Dec", value: 120000 },
  { month: "Jan", value: 95000 },
];

function CustomTooltip({ active, payload, label, text }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1425] px-4 py-3 shadow-xl">
      <p className="text-white/80">{label}</p>
      <p className="text-sm mt-1 font-semibold" style={{ color: ACCENT }}>
        {text} {payload[0].value}
      </p>
    </div>
  );
}

export default function DemoAdmin() {
  const [sortEmployeeBy, setSortEmployeeBy] = useState(null);
  const [sortEmployeeDir, setSortEmployeeDir] = useState("asc");
  const [filterDept, setFilterDept] = useState("All");

  const departments = useMemo(() => {
    const set = new Set(DEMO_EMPLOYEES.map((e) => e.department));
    return ["All", ...Array.from(set)];
  }, []);

  const sortedEmployees = useMemo(() => {
    if (!sortEmployeeBy) return DEMO_EMPLOYEES;
    return [...DEMO_EMPLOYEES].sort((a, b) => {
      const av = a[sortEmployeeBy];
      const bv = b[sortEmployeeBy];
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortEmployeeDir === "asc" ? cmp : -cmp;
    });
  }, [sortEmployeeBy, sortEmployeeDir]);

  const filteredEmployees = useMemo(() => {
    if (filterDept === "All") return sortedEmployees;
    return sortedEmployees.filter((e) => e.department === filterDept);
  }, [sortedEmployees, filterDept]);

  const toggleSort = (key) => {
    if (sortEmployeeBy === key) setSortEmployeeDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortEmployeeBy(key);
      setSortEmployeeDir("asc");
    }
  };

  const SortIcon = ({ columnKey }) =>
    sortEmployeeBy === columnKey ? (
      sortEmployeeDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f0a1a" }}>
      {/* Demo banner */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: "rgba(168,154,201,0.2)", backgroundColor: "rgba(37,26,60,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/demo"
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back to roles
          </Link>
          <span
            className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "rgba(168,154,201,0.25)", color: ACCENT }}
          >
            Demo — sample data only
          </span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium px-4 py-2 rounded-lg text-white border border-white/20 hover:border-white/40 transition-colors"
        >
          Sign in for real account
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 sm:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Employees", value: "5", sub: "+8% vs last month", icon: Users, color: THEME },
            { label: "Active Projects", value: "3", sub: "+12% vs last month", icon: FolderKanban, color: "#0ea5e9" },
            { label: "Monthly Revenue", value: "$40K", sub: "+15% vs last month", icon: DollarSign, color: THEME },
            { label: "Open Blockers", value: "2", sub: null, icon: AlertTriangle, color: "#f97316" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-5 flex justify-between border border-white/10"
              style={{ backgroundColor: "rgba(37,26,60,0.4)" }}
            >
              <div>
                <p className="text-sm text-white/55">{s.label}</p>
                <p className="text-xl font-bold text-white mt-1">{s.value}</p>
                {s.sub && <p className="text-xs text-emerald-400/90 mt-1">{s.sub}</p>}
              </div>
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: s.color }}
              >
                <s.icon size={22} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className="rounded-xl p-6 border border-white/10"
            style={{ backgroundColor: "rgba(37,26,60,0.4)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-full">
                +15% this month
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_DATA}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip text="Revenue:" />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={ACCENT}
                    strokeWidth={2}
                    dot={{ fill: ACCENT }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="rounded-xl p-6 border border-white/10"
            style={{ backgroundColor: "rgba(37,26,60,0.4)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Project Progress</h3>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/20 px-3 py-1.5 rounded-full">
                3 Active
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO_PROJECTS} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={90} />
                  <Tooltip content={<CustomTooltip text="Progress:" />} />
                  <Bar dataKey="progress" fill={ACCENT} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Employees table (interactive) */}
        <div
          className="rounded-xl p-6 border border-white/10"
          style={{ backgroundColor: "rgba(37,26,60,0.4)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-bold text-white">Employees (demo)</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/55">Department:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#1a1425]">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/60 border-b border-white/10">
                  <th className="pb-3 pr-4 font-medium">
                    <button
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Name <SortIcon columnKey="name" />
                    </button>
                  </th>
                  <th className="pb-3 pr-4 font-medium">
                    <button
                      onClick={() => toggleSort("role")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Role <SortIcon columnKey="role" />
                    </button>
                  </th>
                  <th className="pb-3 pr-4 font-medium">
                    <button
                      onClick={() => toggleSort("department")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Department <SortIcon columnKey="department" />
                    </button>
                  </th>
                  <th className="pb-3 font-medium">
                    <button
                      onClick={() => toggleSort("status")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Status <SortIcon columnKey="status" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{emp.name}</td>
                    <td className="py-3 pr-4 text-white/80">{emp.role}</td>
                    <td className="py-3 pr-4 text-white/80">{emp.department}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          emp.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-white/40">
            This is sample data. Sort by column headers or filter by department to explore.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-white/60 mb-4">Ready to manage your own team and projects?</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${THEME} 0%, ${ACCENT} 100%)` }}
          >
            Sign in to get started
          </Link>
        </div>
      </div>
    </div>
  );
}
