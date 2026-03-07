import React from "react";

/**
 * Single insight/KPI card for dashboards. Use in a grid of 4 for consistent "insight action cards".
 * Generic: works for HR, Finance, PM, Employee, and admin-created dashboards.
 * @param {string} title - e.g. "Active Employees"
 * @param {string|number} value - e.g. "5" or "11"
 * @param {string} [subtitle] - e.g. "+8% vs last month"
 * @param {React.ReactNode} icon - Lucide or custom icon element
 * @param {string} iconBg - Tailwind classes for icon container, e.g. "bg-[var(--primary)]" or "bg-gradient-to-br from-emerald-500 to-green-400"
 */
export function DashboardInsightCard({ title, value, subtitle, icon, Icon, iconBg = "bg-[var(--primary)]" }) {
  const iconEl = icon ?? (Icon ? <Icon className="h-6 w-6" /> : null);
  return (
    <div className="rounded-xl p-6 flex justify-between border border-[var(--border)] bg-[var(--card)]/80 hover:shadow-md transition-shadow">
      <div className="min-w-0">
        <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
        <p className="text-2xl font-bold my-2 text-[var(--foreground)]">{value}</p>
        {subtitle && (
          <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div
        className={`flex items-center justify-center h-12 w-12 text-white rounded-lg shrink-0 ${iconBg}`}
      >
        {iconEl}
      </div>
    </div>
  );
}
