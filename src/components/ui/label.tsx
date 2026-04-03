import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "mb-2 block font-label text-xs font-bold tracking-wider text-on-surface-variant uppercase",
        className
      )}
      {...props}
    />
  );
}

export { Label };
