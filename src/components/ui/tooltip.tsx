"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ComponentProps } from "react";
import { type AsChildProps, resolveRender } from "@/lib/resolve-render";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delay = 0,
  delayDuration,
  ...props
}: TooltipPrimitive.Provider.Props & {
  /** @deprecated Use `delay` instead */
  delayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delayDuration ?? delay}
      {...props}
    />
  );
}

function Tooltip({
  delayDuration,
  delay,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Root> & {
  /** @deprecated Use `delay` on TooltipProvider */
  delayDuration?: number;
  delay?: number;
}) {
  return (
    <TooltipProvider delay={delayDuration ?? delay}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  asChild,
  render,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Trigger> & AsChildProps) {
  const resolvedRender = resolveRender(render, asChild, children);

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      render={resolvedRender}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipContent({
  className,
  sideOffset = 0,
  side = "top",
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          className={cn(
            "fade-in-0 zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--transform-origin) animate-in text-balance rounded-md bg-foreground px-3 py-1.5 text-background text-xs data-closed:animate-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            className
          )}
          data-slot="tooltip-content"
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
