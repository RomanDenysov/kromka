"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";
import { type AsChildProps, resolveRender } from "@/lib/resolve-render";

import { cn } from "@/lib/utils";

function Popover({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  asChild,
  render,
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> & AsChildProps) {
  const resolvedRender = resolveRender(render, asChild, children);

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={resolvedRender}
      {...props}
    >
      {children}
    </PopoverPrimitive.Trigger>
  );
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  onCloseAutoFocus,
  onOpenAutoFocus,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    /** @deprecated Radix compat — no-op in Base UI */
    onCloseAutoFocus?: (event: Event) => void;
    /** @deprecated Radix compat — no-op in Base UI */
    onOpenAutoFocus?: (event: Event) => void;
  }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn(
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-closed:animate-out data-open:animate-in",
            className
          )}
          data-slot="popover-content"
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

/** No Base UI equivalent — inert passthrough for API compatibility */
function PopoverAnchor({ ...props }: ComponentProps<"div">) {
  return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
