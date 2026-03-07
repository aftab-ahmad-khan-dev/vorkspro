import React from "react";
import { Edit, Trash2 } from "lucide-react";
import CustomTooltip from "@/components/Tooltip";

export default function TransactionCard({ item, type, onEdit, onDelete }) {
  return (
    <div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[var(--border)]/20 rounded-xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-[var(--foreground)] flex-1 pr-2">
          {item.name}
        </h3>
        <div className="flex gap-2">
          <CustomTooltip tooltipContent={`Update ${type === "income" ? "Income" : "Expense"}`}>
            <button
              onClick={() => onEdit(item)}
              className="p-2.5 rounded-lg text-[var(--foreground)] cursor-pointer hover:text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </CustomTooltip>
          <CustomTooltip tooltipContent={`Delete ${type === "income" ? "Income" : "Expense"}`}>
            <button
              onClick={() => onDelete(item)}
              className="p-2.5 rounded-lg hover:bg-red-500/20 cursor-pointer transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </CustomTooltip>
        </div>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] line-clamp-3">
        {item.description || "No description provided."}
      </p>
    </div>
  );
}
