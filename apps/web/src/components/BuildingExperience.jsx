import React from "react";

/**
 * Reusable "We're Building This Experience" block for pages that are still in development.
 * Use on Payroll, Report, Performance, etc. — not on Dashboard (Dashboard shows real-time insights only).
 * @param {string} [pageName] - Optional page/module name, e.g. "Payroll", "Reports", "Performance"
 */
export default function BuildingExperience({ pageName }) {
  const label = pageName ? `This ${pageName} module` : "This module";
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/20 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
          <span className="relative flex h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          In development
        </span>
      </div>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        We&apos;re Building This Experience
      </h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {label} is currently being engineered and tested to meet our production
        standards—focused on <span className="text-[var(--primary)] font-medium">speed</span>,{" "}
        <span className="text-[var(--primary)] font-medium">security</span>, and{" "}
        <span className="text-[var(--primary)] font-medium">reliability</span>.
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-[var(--border)]">
        <div className="text-left">
          <p className="text-sm font-semibold text-[var(--foreground)]">Release readiness</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Finalizing core flows • QA validation • UX polish
          </p>
        </div>
        <div className="flex items-center gap-2 justify-start sm:justify-end">
          <span className="text-xs text-[var(--muted-foreground)]">Status</span>
          <span className="inline-flex items-center rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/20 px-2.5 py-1 text-xs font-medium text-[var(--primary)]">
            Testing
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-[var(--muted)] overflow-hidden">
          <div className="h-full w-[62%] rounded-full bg-[var(--primary)]" />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <span>In progress</span>
          <span>62%</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Thanks for your patience—this will ship as soon as it passes our quality gates.
      </p>
    </div>
  );
}
