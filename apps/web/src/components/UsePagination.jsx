// src/utils/UsePagination.jsx
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({
  total,
  current,
  pageSize,
  onPageChange,
  lastPage,
}) {
  if (total <= pageSize || total === 0) return null;

  const totalPages = lastPage;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const delta = Math.floor(maxVisible / 2);

    let start = Math.max(2, current - delta);
    let end = Math.min(totalPages - 1, current + delta);

    if (current <= delta + 1) {
      end = Math.min(maxVisible, totalPages - 1);
    } else if (current >= totalPages - delta) {
      start = Math.max(totalPages - maxVisible + 1, 2);
    }

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
      {/* First Page */}
      <Button
        size="sm"
        disabled={current === 1}
        onClick={() => onPageChange(1)}
        className="hidden sm:flex"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous */}
      <Button
        size="sm"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-3 py-1.5 text-sm text-[var(--muted-foreground)]"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-200
              ${
                current === page
                  ? "bg-[var(--primary)] border-2 border-[var(--border)] text-white hover:bg-[var(--primary)]/90"
                  : "bg-transparent border border-[var(--border)] text-[var(--card-foreground)] hover:bg-[var(--border)]/50"
              }`}
          >
            {page}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        size="sm"
        disabled={current === totalPages}
        onClick={() => onPageChange(current + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page */}
      <Button
        size="sm"
        disabled={current === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="hidden sm:flex"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
