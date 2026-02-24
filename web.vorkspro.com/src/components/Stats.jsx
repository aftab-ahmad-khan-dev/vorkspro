import React from "react";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  cardClass,
  titleClass,
  value,
  valueClass,
  subtitle,
  icon,
  iconClass,
  isLoading = false,
}) {
  return (
    <div
      className={`rounded-xl p-6 transition-all hover:shadow-md text-foreground ${
        cardClass
          ? cardClass
          : "bg-[var(--background)] border border-[var(--border)]"
      }`}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn("text-sm text-[var(--muted-foreground)]", titleClass)}
        >
          {isLoading ? (
            <div className="h-3 w-20 rounded bg-[var(--border)] animate-pulse" />
          ) : (
            title
          )}
        </h3>

        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isLoading && "bg-[var(--border)] animate-pulse",
            iconClass
          )}
        >
          {!isLoading && icon}
        </div>
      </div>

      {/* ─── Value ─── */}
      {isLoading ? (
        <div className="h-6 w-24 rounded bg-[var(--border)] animate-pulse mb-2" />
      ) : (
        <p
          className={cn(
            "text-3xl text-[var(--text)] mb-1 leading-tight",
            valueClass
          )}
        >
          {value}
        </p>
      )}

      {/* ─── Subtitle ─── */}
      {isLoading ? (
        <div className="h-3 w-32 rounded bg-[var(--border)] animate-pulse" />
      ) : (
        subtitle && (
          <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>
        )
      )}
    </div>
  );
}

export default StatCard;
