import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToggleButton from "@/components/ToggleButton";
import CustomTooltip from "@/components/Tooltip";

export default function CategoryCard({ item, type, icon: Icon, colorKey = "colorCode", onEdit, onDelete, onToggle, isToggling }) {
  return (
    <div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-sm hover:shadow-xl hover:border-[var(--border)]/80 transition-all duration-300"
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${item[colorKey] || "#3B82F6"} 0%, transparent 100%)`,
        }}
      />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3 flex-1 items-start">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: item[colorKey] || "#3B82F6" }}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-md text-[var(--foreground)] truncate">
                {item.name}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">
                {item.description || "No description available"}
              </p>
            </div>
          </div>

          {item.isActive !== undefined && (
            <ToggleButton
              isActive={item.isActive}
              onToggle={() => onToggle(item)}
              isLoading={isToggling}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]/50">
          <span className="text-sm text-[var(--muted-foreground)]">
            {type === "departments" ? `Employees: ${item?.employees?.length || 0}` : ""}
          </span>

          <div className="flex gap-1">
            <CustomTooltip tooltipContent="Update">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(item)}
                className="h-9 w-9 bg-transparent hover:bg-[var(--primary)]/20 dark:hover:bg-[var(--button)]/20 text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-200"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CustomTooltip>
            <CustomTooltip tooltipContent="Delete">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(item)}
                className="h-9 w-9 bg-transparent hover:bg-red-500/20 text-red-600 hover:text-red-600 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CustomTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
