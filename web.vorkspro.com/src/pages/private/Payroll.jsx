import React, { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Loader2, ExternalLink, History } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/Stats";
import { apiGet, apiGetByFilter } from "@/interceptor/interceptor";

function formatCurrency(num) {
  if (num == null || num === "") return "—";
  return new Intl.NumberFormat("en-PK", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Payroll() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [recentSalaryHistory, setRecentSalaryHistory] = useState([]);

  useEffect(() => {
    const promises = [];

    promises.push(
      apiGetByFilter("employee/get-by-filter", {
        page: 1,
        size: 500,
        sort: "createdAt",
        order: "desc",
        status: "active",
      })
        .then((r) => {
          if (r?.isSuccess && r?.employees?.length >= 0) setEmployees(r.employees || []);
          else if (r?.filteredData?.employees) setEmployees(r.filteredData.employees || []);
        })
        .catch(() => {})
    );

    promises.push(
      apiGet("salary-history/recent?limit=15")
        .then((r) => setRecentSalaryHistory(r?.salaryHistory || []))
        .catch(() => {})
    );

    Promise.allSettled(promises).then(() => setLoading(false));
  }, []);

  const totalMonthlySalary = employees.reduce((sum, e) => sum + (Number(e.lastSalary) || Number(e.baseSalary) || 0), 0);
  const withSalary = employees.filter((e) => (Number(e.lastSalary) || Number(e.baseSalary) || 0) > 0);

  return (
    <div className="min-h-screen w-full pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">Payroll</h1>
        <p className="text-sm mt-1 text-[var(--muted-foreground)]">
          Manage payroll and compensation — employees per month, salary and payment history, and insights.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Employees (active)"
          value={loading ? "—" : employees.length}
          subtitle="With payroll visibility"
          icon={<Users size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Total monthly salary"
          value={loading ? "—" : formatCurrency(totalMonthlySalary)}
          subtitle="Sum of current salaries"
          icon={<DollarSign size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="With salary set"
          value={loading ? "—" : withSalary.length}
          subtitle="Employees with last/base salary"
          icon={<TrendingUp size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
        <StatCard
          title="Recent salary changes"
          value={loading ? "—" : recentSalaryHistory.length}
          subtitle="Latest history entries"
          icon={<History size={20} className="text-[var(--primary)]" />}
          isLoading={loading}
        />
      </div>

      {/* Employee payroll list */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Employees & current salary</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[var(--muted-foreground)]">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
            </div>
          ) : employees.length === 0 ? (
            <p className="p-6 text-[var(--muted-foreground)]">No employees to show. Adjust filters or add employees.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Department</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Current salary</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Last increment</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">History</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const salary = Number(emp.lastSalary) ?? Number(emp.baseSalary) ?? 0;
                    const name = [emp.firstName, emp.lastName].filter(Boolean).join(" ") || emp.user?.name || "—";
                    const dept = emp.department?.name ?? "—";
                    return (
                      <tr key={emp._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                        <td className="py-3 px-4 text-[var(--foreground)]">{name}</td>
                        <td className="py-3 px-4 text-[var(--muted-foreground)]">{dept}</td>
                        <td className="py-3 px-4 text-right font-medium text-[var(--foreground)]">{formatCurrency(salary)}</td>
                        <td className="py-3 px-4 text-[var(--muted-foreground)]">{formatDate(emp.lastSalaryIncrementDate)}</td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/app/employees/${emp._id}`}
                            className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                          >
                            View <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Recent salary history & insights */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent salary history</h2>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[var(--muted-foreground)]">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading…
            </div>
          ) : recentSalaryHistory.length === 0 ? (
            <p className="p-6 text-[var(--muted-foreground)]">No salary history yet. Updates will appear here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Employee</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Previous</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">New</th>
                    <th className="text-right py-3 px-4 font-medium text-[var(--foreground)]">Change %</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--foreground)]">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSalaryHistory.map((h) => (
                    <tr key={h._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                      <td className="py-3 px-4 text-[var(--muted-foreground)]">{formatDate(h.date)}</td>
                      <td className="py-3 px-4 text-[var(--foreground)]">{h.employeeName || "—"}</td>
                      <td className="py-3 px-4 text-right text-[var(--muted-foreground)]">{formatCurrency(h.previousSalary)}</td>
                      <td className="py-3 px-4 text-right font-medium text-[var(--foreground)]">{formatCurrency(h.newSalary)}</td>
                      <td className="py-3 px-4 text-right text-[var(--primary)]">
                        {h.incrementPercentage != null ? `${h.incrementPercentage}%` : "—"}
                      </td>
                      <td className="py-3 px-4 text-[var(--muted-foreground)]">{h.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Payroll;
