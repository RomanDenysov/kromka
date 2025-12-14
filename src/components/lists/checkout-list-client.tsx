"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
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

function MobileVariant({
  items,
  totals,
  itemCount,
}: {
  items: DetailedCartItem[];
  totals: { totalCents: number; totalQuantity: number };
  itemCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      className="w-full md:hidden"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border bg-card p-4 text-left transition-colors hover:bg-accent">
        <div className="flex flex-1 flex-col gap-1">
          <span className="font-semibold text-base">
            Košík ({itemCount} {itemCount === 1 ? "položka" : "položky"})
          </span>
          <span className="text-muted-foreground text-sm">
            {formatPrice(totals.totalCents)}
          </span>
        </div>
        <ChevronDownIcon
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 flex flex-col gap-2">
          {items.map((item) => (
            <CheckoutListItem item={item} key={item.productId} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DesktopVariant({
  items,
  itemCount,
}: {
  items: DetailedCartItem[];
  itemCount: number;
}) {
  return (
    <Collapsible className="hidden w-full md:block" open={true}>
      <CollapsibleTrigger className="pointer-events-none flex w-full cursor-default items-center justify-between border-0 bg-transparent p-0 text-left hover:bg-transparent">
        <div className="mb-4 flex flex-1 flex-col gap-1">
          <span className="font-semibold text-lg">
            Košík ({itemCount} {itemCount === 1 ? "položka" : "položky"})
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-0 block">
        <div className="mt-0 flex flex-col gap-2">
          {items.map((item) => (
            <CheckoutListItem item={item} key={item.productId} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CheckoutListClient({ items, totals, upsellProducts }: Props) {
  const itemCount = totals.totalQuantity;

  return (
    <div className="flex flex-col gap-6">
      <MobileVariant itemCount={itemCount} items={items} totals={totals} />
      <DesktopVariant itemCount={itemCount} items={items} />

      {/* Show recommendations on desktop only (mobile will show after form) */}
      <div className="hidden md:block">
        <CheckoutRecommendations products={upsellProducts} />
      </div>
    </div>
  );
}
