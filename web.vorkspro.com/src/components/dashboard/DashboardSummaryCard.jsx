import React from "react";

/**
 * Generic dashboard summary card. Use for every dashboard (HR, Finance, PM, Employee, Admin, and admin-created).
 * Keeps consistent layout: title (uppercase) + one-line summary.
 */
export function DashboardSummaryCard({ title, summary }) {
  return (
    <div className="mb-6 rounded-xl p-4 border border-[var(--border)] bg-[var(--card)]">
      <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-sm text-[var(--foreground)]">{summary}</p>
    </div>
  );
}
