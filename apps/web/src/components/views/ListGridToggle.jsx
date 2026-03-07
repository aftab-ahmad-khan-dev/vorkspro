import React from "react";
import { List, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Toggle between List (table) and Grid (cards) view for listings.
 */
export function ListGridToggle({
  value,
  onValueChange,
  listLabel = "List",
  gridLabel = "Grid",
  className = "",
}) {
  return (
    <>
      <Tabs value={value} onValueChange={onValueChange} className={cn("w-auto", className)}>
        <TabsList className="hidden sm:flex h-10 rounded-lg bg-[var(--muted)]/60 p-1 gap-1 border border-[var(--border)]/50">
          <TabsTrigger
            value="list"
            className="rounded-md gap-2 px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[var(--border)]"
          >
            <List size={16} />
            {listLabel}
          </TabsTrigger>
          <TabsTrigger
            value="grid"
            className="rounded-md gap-2 px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-[var(--background)] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[var(--border)]"
          >
            <LayoutGrid size={16} />
            {gridLabel}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="sm:hidden w-full max-w-[140px] h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="list">
            <span className="flex items-center gap-2">
              <List size={16} />
              {listLabel}
            </span>
          </SelectItem>
          <SelectItem value="grid">
            <span className="flex items-center gap-2">
              <LayoutGrid size={16} />
              {gridLabel}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
