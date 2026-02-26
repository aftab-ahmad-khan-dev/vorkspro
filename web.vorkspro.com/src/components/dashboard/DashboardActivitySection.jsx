import React from "react";

/**
 * Wrapper for "activity related to that department" sections.
 * Use for: Pending Leave, Upcoming Birthdays, Active Projects, Cash Flow, Recent Transactions, etc.
 * Keeps consistent card style across HR, Finance, PM, Employee, and admin-created dashboards.
 */
export function DashboardActivitySection({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-xl p-6 border border-[var(--border)] bg-[var(--card)]/80 ${className}`}
    >
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      {subtitle && (
        <p className="text-sm text-[var(--muted-foreground)] mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}
