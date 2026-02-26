import React from "react";
import { Link } from "react-router-dom";
import { useTabs } from "@/context/TabsContext";
import { getModuleColor, getModulesFromTabs, QUICK_ACTION_LINKS } from "@/config/dashboardConfig";
import {
  Users,
  FolderKanban,
  Briefcase,
  DollarSign,
  FileText,
  Calendar,
  SquareCheckBig,
  MessageSquare,
  Bell,
  BookOpen,
  CreditCard,
  AlertTriangle,
  Package,
} from "lucide-react";

const DEFAULT_ICONS = {
  Users,
  FolderKanban,
  Briefcase,
  DollarSign,
  FileText,
  Calendar,
  SquareCheckBig,
  MessageSquare,
  Bell,
  BookOpen,
  CreditCard,
  AlertTriangle,
  Package,
};

/**
 * Generic Quick Actions block. Renders only modules assigned to the user's role (dynamic).
 * Use on every dashboard for consistent "action btn" layout. Each button uses its module color.
 */
export function DashboardQuickActions({ iconMap = DEFAULT_ICONS, className = "" }) {
  const { tabs } = useTabs();
  const allowedModules = getModulesFromTabs(tabs);
  const actions = QUICK_ACTION_LINKS.filter((q) => allowedModules.includes(q.module));

  if (actions.length === 0) return null;

  return (
    <section className={`rounded-xl p-6 border border-[var(--border)] bg-[var(--card)] ${className}`.trim()}>
      <h3 className="text-lg font-bold mb-1 text-[var(--foreground)]">Quick Actions</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-5">
        Shortcuts to pages in your department. Each uses its module color.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const c = getModuleColor(action.module);
          const Icon = iconMap[action.icon];
          if (!Icon) return null;
          return (
            <Link
              key={`${action.module}-${idx}`}
              to={action.to}
              className={`group flex flex-col items-center justify-center gap-3 rounded-xl py-5 px-3 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${c.bg} ${c.border}`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.icon} text-white shadow-sm group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold text-center leading-tight ${c.text}`}>
                {action.label}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">{action.module}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
