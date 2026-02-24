import React from "react";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";

function Confirmation({
  open,
  onClose,
  onConfirm,
  name,
  title,
  className,
  btnClassName,
}) {
  if (!open) return null;

  return (
    <>
      {/* ─── Backdrop ─── */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* ─── Dialog Content ─── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative bg-[var(--background)] text-[var(--foreground)] rounded-2xl shadow-xl max-w-sm w-full p-6 text-center transform transition-all duration-200 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Icon ─── */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full ${
                className || "bg-red-100 text-red-500 dark:bg-red-400/20"
              }`}
            >
              <CircleAlert />
            </div>
          </div>

          {/* ─── Title ─── */}
          <h2 className="text-lg font-semibold mb-2">
            {title || "Delete"} {title ? "" : name ? name : "item"}
          </h2>

          {/* ─── Message ─── */}
          <p className="text-gray-600 text-sm mb-6">
            Are you sure you want to {title || "delete"} {title ? "" : "this"}{" "}
            {title ? "" : name ? name.toLowerCase() : "item"}?
            <br />
            This action cannot be undone.
          </p>

          {/* ─── Actions ─── */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={onClose}
              className="dark:bg-gray-700 bg-gray-500 hover:bg-gray-600 dark:hover:bg-gray-800 text-white px-6 py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className={` ${
                btnClassName
                  ? btnClassName
                  : " bg-red-600 hover:bg-red-700 text-white"
              } px-6 py-2 rounded-md`}
            >
              {title ? title : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Confirmation;
