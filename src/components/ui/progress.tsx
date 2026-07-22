"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      data-slot="progress"
      value={value}
      {...props}
    >
      <ProgressPrimitive.Track className="size-full">
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-primary transition-transform duration-300 ease-out motion-reduce:duration-150"
          data-slot="progress-indicator"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
