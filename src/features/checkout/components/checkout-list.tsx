"use client";

import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { getItemCountString } from "@/lib/item-count-string";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  totals: { totalCents: number; totalQuantity: number };
  children: ReactNode;
};

export function CheckoutList({ totals, children }: Props) {
  const isMobile = useIsMobile();
  const { totalCents, totalQuantity } = totals;
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <Collapsible
        className="w-full md:hidden"
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border bg-card p-4 text-left transition-colors hover:bg-accent">
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-semibold text-base">
              Košík ({getItemCountString(totalQuantity)})
            </span>
            <span className="text-muted-foreground text-sm">
              {formatPrice(totalCents)}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Show recommendations on desktop only (mobile will show after form) */}
      {children}
    </div>
  );
}
