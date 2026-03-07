import React from "react";
import { Edit, Trash2, User } from "lucide-react";
import CustomTooltip from "@/components/Tooltip";

export default function SubDepartmentCard({ item, onEdit, onDelete }) {
  return (
    <div className="bg-[var(--border)]/20 rounded-xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium border border-[var(--border)] text-[var(--muted-foreground)] px-2 py-1 rounded-full">
          {item.department?.name || "N/A"}
        </span>
        <div className="flex gap-1">
          <CustomTooltip tooltipContent="Update Sub Department">
            <button
              onClick={() => onEdit(item)}
              className="p-2.5 rounded-lg hover:bg-[var(--primary)]/20 hover:text-[var(--primary)] cursor-pointer disabled:pointer-events-none transition-colors disabled:opacity-50"
              title="Edit"
              disabled={item.department?.isActive == false}
            >
              <Edit className="w-4 h-4" />
            </button>
          </CustomTooltip>
          <CustomTooltip tooltipContent="Delete Sub Department">
            <button
              onClick={() => onDelete(item)}
              className="p-2.5 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50"
              title="Delete"
              disabled={item.department?.isActive == false}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </CustomTooltip>
        </div>
      </div>
      <h3 className="font-semibold text-lg text-[var(--foreground)] mb-1">
        {item.name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
        <User className="w-4 h-4" />
        <span>{item.employees?.length ?? 0} employees</span>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
        {item.description || "No description provided."}
      </p>
    </div>
  );
}
