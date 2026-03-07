// src/components/ToggleButton.jsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@radix-ui/react-label";
import React from "react";
import { Loader2 } from "lucide-react";

const ToggleButton = ({ isActive, onToggle, isLoading = false, scale }) => {
  return (
    <div className="cursor-pointer flex items-center space-x-3">
      <div className="relative cursor-pointer">
        <Switch
          id={`toggle-${Math.random().toString(36)}`}
          checked={isActive}
          onCheckedChange={onToggle}
          disabled={isLoading}
          className={`scale-${scale} data-[state=checked]:bg-[var(--button)]/50 dark:data-[state=checked]:bg-[var(--button)]/40  `}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* <Loader2 className="h-3 w-3 animate-spin text-white" /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleButton;
