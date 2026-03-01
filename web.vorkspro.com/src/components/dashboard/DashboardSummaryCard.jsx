import React from "react";
import { LayoutDashboard } from "lucide-react";

/**
 * Generic dashboard summary card. Use for every dashboard (HR, Finance, PM, Employee, Admin, and admin-created).
 */
export function DashboardSummaryCard({ title, summary }) {
  return (
    <div
      id="driver-dashboard-summary"
      className="relative overflow-hidden rounded-2xl p-6 border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--primary)]/20"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--primary)]/10 to-transparent rounded-bl-full pointer-events-none" />
      <div className="relative flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/15 flex items-center justify-center flex-shrink-0 ring-1 ring-[var(--primary)]/20">
          <LayoutDashboard className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
            {title}
          </p>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}
