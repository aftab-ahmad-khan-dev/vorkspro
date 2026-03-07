import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer cursor-pointer data-[state=checked]:bg-primary  data-[state=unchecked]:bg-input/90 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/30 inline-flex h-[1rem] w-8.5 shrink-0 items-center rounded-full shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background cursor-pointer data-[state=unchecked]:bg-[var(--button)] data-[state=checked]:bg-[var(--button)] border border-[var(--button)] pointer-events-none block size-4.5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
