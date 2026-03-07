import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Project-wide: Enter = submit form, Shift+Enter = new line.
 */
function handleTextareaKeyDown(e, onKeyDown) {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      // Shift+Enter: allow default (insert new line)
      onKeyDown?.(e);
      return;
    }
    // Enter: submit closest form, do not insert new line
    e.preventDefault();
    const form = e.target.closest("form");
    if (form && typeof form.requestSubmit === "function") {
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn && !submitBtn.disabled) form.requestSubmit();
    }
    onKeyDown?.(e);
    return;
  }
  onKeyDown?.(e);
}

function Textarea({
  className,
  onKeyDown,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onKeyDown={(e) => handleTextareaKeyDown(e, onKeyDown)}
      {...props}
    />
  );
}

export { Textarea }
