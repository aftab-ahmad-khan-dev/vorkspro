import React from "react";

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4 shadow-sm bg-white dark:bg-slate-900 animate-pulse"
        >
          <div className="h-4 w-1/3 bg-[var(--border)] rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-[var(--border)] rounded"></div>
            <div className="h-3 w-5/6 bg-[var(--border)] rounded"></div>
            <div className="h-3 w-4/6 bg-[var(--border)] rounded"></div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-20 bg-[var(--border)] rounded"></div>
            <div className="h-8 w-20 bg-[var(--border)] rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
