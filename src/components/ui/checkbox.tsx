"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  checked,
  ...props
}: Omit<ComponentProps<typeof CheckboxPrimitive.Root>, "checked"> & {
  checked?: boolean | "indeterminate";
}) {
  const isIndeterminate = checked === "indeterminate";
  const resolvedChecked =
    checked === "indeterminate" ? false : checked;

  return (
    <CheckboxPrimitive.Root
      checked={resolvedChecked}
      className={cn(
        "peer size-4 shrink-0 touch-manipulation rounded-[4px] border border-input shadow-xs outline-none transition-[box-shadow,transform] duration-150 ease-out motion-reduce:transition-none motion-safe:active:scale-90 motion-reduce:active:scale-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:bg-input/30 dark:data-checked:bg-primary dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="checkbox"
      indeterminate={isIndeterminate}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="grid place-content-center text-current transition-none"
        data-slot="checkbox-indicator"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
