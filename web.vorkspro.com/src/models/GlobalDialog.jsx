import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function GlobalDialog({ open, onClose, children, className, label }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();

      // Ignore Escape when user is typing inside form controls
      if (["input", "textarea", "select"].includes(tag)) return;

      if (e.key === "Escape") {
        e.preventDefault();
        typeof onClose === "function" && onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Full viewport overlay */}
      <div
        className="fixed inset-0 w-screen h-screen bg-black/60 backdrop-blur-sm opacity-100 transition-opacity duration-200"
        style={{ width: '100vw', height: '100vh' }}
        onClick={onClose}
      />

      {/* Dialog Content - same size as before */}
      <div
        className={cn(
          "relative z-10 bg-white dark:bg-[var(--background)] text-black dark:text-white rounded-2xl shadow-2xl overflow-y-auto transform transition-all duration-200",
          className ?? "max-w-lg w-full max-h-[600px]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        {label && (
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-[var(--background)] p-6">
            <h2 className="text-xl font-semibold">{label}</h2>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pt-2 pb-6">{children}</div>

        {/* Close Button when no Label header */}
        {!label && (
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default GlobalDialog;
