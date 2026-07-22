"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import type { ComponentProps } from "react";
import { type AsChildProps, resolveRender } from "@/lib/resolve-render";

function Collapsible({
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  asChild,
  render,
  children,
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.Trigger> & AsChildProps) {
  const resolvedRender = resolveRender(render, asChild, children);

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      render={resolvedRender}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Trigger>
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
