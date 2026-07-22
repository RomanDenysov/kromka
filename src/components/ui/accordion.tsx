"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type AccordionRootProps = ComponentProps<typeof AccordionPrimitive.Root> & {
  /** @deprecated Use `multiple` instead — `type="multiple"` maps to `multiple` */
  type?: "single" | "multiple";
  /** Radix compat: allow collapsing all items in single mode (no-op when `multiple`) */
  collapsible?: boolean;
};

function Accordion({
  type,
  collapsible = true,
  multiple,
  onValueChange,
  ...props
}: AccordionRootProps) {
  const resolvedMultiple = multiple ?? type === "multiple";

  const handleValueChange = (
    value: AccordionPrimitive.Root.Value,
    eventDetails: AccordionPrimitive.Root.ChangeEventDetails
  ) => {
    if (!resolvedMultiple && !collapsible && value.length === 0) {
      eventDetails.cancel();
      return;
    }

    onValueChange?.(value, eventDetails);
  };

  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      multiple={resolvedMultiple}
      onValueChange={handleValueChange}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn("border-b last:border-b-0", className)}
      data-slot="accordion-item"
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  hasUnderline = false,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger> & {
  hasUnderline?: boolean;
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 md:text-base [&[data-panel-open]>svg]:rotate-180",
          className,
          hasUnderline && "hover:underline"
        )}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 md:size-5" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Panel>) {
  return (
    <AccordionPrimitive.Panel
      className="overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
      data-slot="accordion-content"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
