"use client";

import { ChevronDownIcon } from "lucide-react";
import { Activity, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DetailedCartItem } from "@/lib/cart/queries";
import type { Product } from "@/lib/queries/products";
import { cn, formatPrice } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { CheckoutListItem } from "./checkout-list-item";
import { CheckoutRecommendations } from "./checkout-recommendations";

type Props = {
  items: DetailedCartItem[];
  totals: { totalCents: number; totalQuantity: number };
  upsellProducts: Product[];
};

export function CheckoutListClient({ items, totals, upsellProducts }: Props) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const itemCount = totals.totalQuantity;

  return (
    <div className="flex flex-col gap-6">
      <Collapsible className="w-full" onOpenChange={setIsOpen} open={!isMobile}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between rounded-md border bg-card p-4 text-left transition-colors hover:bg-accent",
            "md:pointer-events-none md:cursor-default md:border-0 md:bg-transparent md:p-0 md:hover:bg-transparent"
          )}
        >
          <div className="flex flex-1 flex-col gap-1 md:mb-4">
            <span className="font-semibold text-base md:text-lg">
              Košík ({itemCount} {itemCount === 1 ? "položka" : "položky"})
            </span>
            <span className="text-muted-foreground text-sm md:hidden">
              {formatPrice(totals.totalCents)}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
              "md:hidden"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="md:mt-0 md:block">
          <div className="mt-2 flex flex-col gap-2 md:mt-0">
            {items.map((item) => (
              <CheckoutListItem item={item} key={item.productId} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Show recommendations on desktop only (mobile will show after form) */}
      <Activity mode={isMobile ? "hidden" : "visible"}>
        <CheckoutRecommendations products={upsellProducts} />
      </Activity>
    </div>
  );
}
