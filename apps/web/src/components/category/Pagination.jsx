import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ total, current, onChange, disabled, pageSize = 10 }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safeCurrent = Math.max(1, Math.min(current, totalPages));

  useEffect(() => {
    if (current > totalPages && totalPages > 0) onChange(totalPages);
    else if (current < 1) onChange(1);
  }, [current, totalPages, onChange]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || safeCurrent === 1}
        onClick={() => onChange(safeCurrent - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-[var(--muted-foreground)]">
        Page {safeCurrent} of {totalPages}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || safeCurrent === totalPages}
        onClick={() => onChange(safeCurrent + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
