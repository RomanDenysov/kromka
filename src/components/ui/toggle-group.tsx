"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type { VariantProps } from "class-variance-authority";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  useContext,
} from "react";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
});

type ToggleGroupProps = Omit<
  ComponentProps<typeof ToggleGroupPrimitive>,
  "type"
> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    /** @deprecated Use `multiple` instead */
    type?: "single" | "multiple";
  };

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  type,
  multiple,
  ...props
}: ToggleGroupProps) {
  const resolvedMultiple = multiple ?? type === "multiple";

  return (
    <ToggleGroupPrimitive
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      data-size={size}
      data-slot="toggle-group"
      data-spacing={spacing}
      data-variant={variant}
      multiple={resolvedMultiple}
      style={{ "--gap": spacing } as CSSProperties}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ComponentProps<typeof TogglePrimitive> &
  VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:first:border-l data-[spacing=0]:first:rounded-l-md",
        className
      )}
      data-size={context.size || size}
      data-slot="toggle-group-item"
      data-spacing={context.spacing}
      data-variant={context.variant || variant}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
