import React, { useEffect, useRef } from "react";
import { ArrowBigLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  const primaryBtnRef = useRef(null);

  // Safely get theme with fallback to "light"
  const theme = localStorage.getItem("themeMode") || "light";

  // Auto-focus the button on mount
  useEffect(() => {
    primaryBtnRef.current?.focus();
  }, []);

  // Keyboard shortcut: Press 'D' to go to Dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;

      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        navigate("/dashboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div
      className={`min-h-screen relative flex items-center justify-center px-6 text-center transition-colors
                  ${
                    theme === "dark"
                      ? "bg-[#0A1224] text-white"
                      : "bg-white text-black"
                  }`}
      aria-labelledby="nf-title"
    >
      {/* Soft glowing background effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0
                   [background:radial-gradient(45rem_45rem_at_50%_-10%,hsl(var(--primary)/0.10),transparent_70%)]"
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* Warning Icon */}
        <div
          className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl
                     ${
                       theme === "dark"
                         ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                         : "bg-primary/10 border border-primary/20 text-primary"
                     }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* 404 Title */}
        <h1
          id="nf-title"
          className="text-6xl font-extrabold tracking-tight mb-3"
        >
          404
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg mb-8 text-muted-foreground">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            ref={primaryBtnRef}
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                       shadow-[0_4px_20px_hsl(var(--primary)/0.35)]
                       hover:shadow-[0_6px_30px_hsl(var(--primary)/0.45)]
                       transition-all duration-300 ease-out active:scale-[0.97]"
            aria-label="Go back to Dashboard (Press D)"
          >
            <ArrowBigLeft
              className="h-6 ml-1 w-6 transition-transform duration-300 
                         group-hover:-translate-x-1 group-hover:scale-110"
            />
            <span>Go Back</span>
            {/* <span className="text-xs opacity-80 group-hover:opacity-90">
              (D)
            </span> */}
          </Button>
        </div>

        {/* Keyboard Hint */}
        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Press{" "}
          <kbd
            className={`px-1.5 py-0.5 rounded text-xs font-medium
                       ${
                         theme === "dark"
                           ? "bg-white/10 text-gray-300"
                           : "bg-muted text-muted-foreground"
                       }`}
          >
            D
          </kbd>{" "}
          for Dashboard.
        </p>
      </div>
    </div>
  );
}
