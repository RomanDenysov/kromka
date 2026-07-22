"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Popover({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  render,
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={render}
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
  initialFocus,
  finalFocus,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    /** @deprecated Use `finalFocus={false}` instead */
    onCloseAutoFocus?: (event: Event) => void;
    /** @deprecated Use `initialFocus={false}` instead */
    onOpenAutoFocus?: (event: Event) => void;
  }) {
  const resolvedInitialFocus =
    initialFocus ??
    (onOpenAutoFocus
      ? () => {
          const event = new Event("focusin");
          onOpenAutoFocus(event);
          return event.defaultPrevented ? false : true;
        }
      : undefined);

  const resolvedFinalFocus =
    finalFocus ??
    (onCloseAutoFocus
      ? () => {
          const event = new Event("focusout");
          onCloseAutoFocus(event);
          return event.defaultPrevented ? false : true;
        }
      : undefined);

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
          finalFocus={resolvedFinalFocus}
          initialFocus={resolvedInitialFocus}
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
