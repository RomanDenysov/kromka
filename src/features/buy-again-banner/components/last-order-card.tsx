"use client";

import { ChevronUpIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getItemCountString } from "@/lib/item-count-string";
import { cn, formatPrice } from "@/lib/utils";
import { useBuyAgainOrder } from "../hooks/use-buy-again-order";
import { useBuyAgainVisible } from "../store";

const DISPLAY_ITEM_LIMIT = 3;

interface OrderItem {
  imageUrl: string | null;
  name: string;
  priceCents: number;
  productId: string;
  quantity: number;
  slug: string;
}

interface Props {
  items: OrderItem[];
}

export function LastOrderCard({ items }: Props) {
  const visible = useBuyAgainVisible();
  const [isOpen, setIsOpen] = useState(false);
  const { isPending, repeatOrder } = useBuyAgainOrder();

  if (items.length === 0 || !visible) {
    return null;
  }

  const displayItems = items.slice(0, DISPLAY_ITEM_LIMIT);
  const hiddenItemCount = items.length - DISPLAY_ITEM_LIMIT;
  const totalPrice = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <div className="rounded-sm border border-muted-foreground/30 border-dashed bg-muted/40 p-3">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between gap-3">
            {!isOpen && (
              <Button
                className="fade-in-0 animate-in duration-400"
                id="repeat-order-icon-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  repeatOrder(items, "cart_drawer");
                }}
                size="icon"
                type="button"
                variant="outline"
              >
                <ShoppingCartIcon className="size-5" />
                <span className="sr-only">Zopakovať objednávku</span>
              </Button>
            )}
            <div className="mr-auto flex flex-col gap-1">
              <h3 className="font-semibold text-sm">
                Vaša posledná objednávka
              </h3>
              <p className="text-muted-foreground text-xs">
                {getItemCountString(items.length)}
              </p>
            </div>

            <ChevronUpIcon
              className={cn(
                "size-5 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="fade-in-0 animate-in duration-400">
          <div className="mt-2 space-y-1">
            {displayItems.map((item) => (
              <div className="flex gap-2" key={item.productId}>
                <ProductImage
                  alt={item.name}
                  className="size-12 rounded object-cover"
                  height={48}
                  src={item.imageUrl ?? "/images/cooperation.jpg"}
                  width={48}
                />
                <div className="flex flex-1 flex-col justify-center">
                  <p className="line-clamp-1 font-medium text-sm">
                    {item.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {item.quantity}x {formatPrice(item.priceCents)}
                  </p>
                </div>
              </div>
            ))}

            {hiddenItemCount > 0 && (
              <p className="py-1 text-center text-muted-foreground text-xs">
                +{hiddenItemCount}{" "}
                {`ďalš${hiddenItemCount === 1 ? "á" : "ích"}`} položk
                {hiddenItemCount === 1 ? "a" : "y"}
              </p>
            )}
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0">
              <span className="font-medium text-muted-foreground text-xs">
                Celkom:
              </span>
              <span className="font-semibold text-sm leading-none">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <Button
              className="flex-1"
              disabled={isPending}
              id="repeat-order-button"
              onClick={() => repeatOrder(items, "cart_drawer")}
              size="sm"
              type="button"
              variant="default"
            >
              {isPending ? (
                <Spinner className="size-4" />
              ) : (
                <ShoppingCartIcon />
              )}
              Zopakovať objednávku
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
