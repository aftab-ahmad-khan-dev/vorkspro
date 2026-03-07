import React from "react";
import { LayoutGrid, Calendar, Columns3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VIEWS = [
  { value: "list", label: "List", icon: LayoutGrid },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "kanban", label: "Kanban", icon: Columns3 },
];

/**
 * View toggle: List | Calendar | Kanban.
 * @param {string} value - current view
 * @param {function} onValueChange - (view) => void
 * @param {string[]} [enabledViews] - e.g. ["list", "calendar", "kanban"]. Default all.
 * @param {string} [listLabel] - e.g. "List" or "Table"
 */
export function ViewToggle({
  value,
  onValueChange,
  enabledViews = ["list", "calendar", "kanban"],
  listLabel = "List",
  className = "",
}) {
  const options = VIEWS.map((v) => ({
    ...v,
    label: v.value === "list" ? listLabel : v.label,
  })).filter((v) => enabledViews.includes(v.value));

  if (options.length <= 1) return null;

  return (
    <>
      <Tabs value={value} onValueChange={onValueChange} className={cn("w-full", className)}>
        <TabsList className="hidden sm:flex h-11 rounded-xl bg-[var(--muted)]/60 p-1.5 gap-1 border border-[var(--border)]/50">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <TabsTrigger
                key={opt.value}
                value={opt.value}
                className="rounded-lg gap-2 px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-[var(--border)] data-[state=inactive]:text-[var(--muted-foreground)]"
              >
                <Icon size={16} className="opacity-80" />
                {opt.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="sm:hidden w-full max-w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <Icon size={16} />
                  {opt.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </>
  );
}
