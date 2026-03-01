import React from "react";
import { Link } from "react-router-dom";
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
  to,
}) {
  const content = (
    <>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn("text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider", titleClass)}
        >
          {isLoading ? (
            <div className="h-3 w-20 rounded bg-[var(--border)] animate-pulse" />
          ) : (
            title
          )}
        </h3>

        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0",
            "bg-[var(--primary)]/15 ring-1 ring-[var(--primary)]/30 text-[var(--primary)]",
            isLoading && "bg-[var(--border)] animate-pulse ring-0",
            iconClass
          )}
        >
          {!isLoading && icon && (
            <span className="[&>svg]:min-w-5 [&>svg]:min-h-5 [&>svg]:shrink-0 [&>svg]:text-inherit flex items-center justify-center">
              {icon}
            </span>
          )}
        </div>
      </div>

      {/* ─── Value ─── */}
      {isLoading ? (
        <div className="h-8 w-28 rounded bg-[var(--border)] animate-pulse mb-2" />
      ) : (
        <p
          className={cn(
            "text-3xl font-bold text-[var(--foreground)] mb-1 leading-tight tracking-tight",
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
    </>
  );

  const cardClassName = cn(
    "group relative rounded-2xl p-6 overflow-hidden",
    "border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm",
    "transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/5 hover:border-[var(--primary)]/30 hover:-translate-y-0.5",
    "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-[var(--primary)]/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:pointer-events-none",
    to && "cursor-pointer block",
    cardClass
  );

  if (to) {
    return (
      <Link to={to} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export default StatCard;
