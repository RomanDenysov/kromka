"use client";

import { ChevronRightIcon } from "lucide-react";
import { useTransition } from "react";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { addItemsToCart } from "@/features/cart/actions";
import { formatPrice } from "@/lib/utils";

const DISPLAY_ITEM_LIMIT = 3;

type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type Props = {
  items: OrderItem[];
};

/**
 * Card showing the last 2-3 items from user's most recent order
 * Allows quick re-ordering with a single click
 */
export function LastOrderCard({ items }: Props) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return null;
  }

  const displayItems = items.slice(0, DISPLAY_ITEM_LIMIT);
  const hiddenItemCount = items.length - DISPLAY_ITEM_LIMIT;
  const totalPrice = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const handleRepeatOrder = () => {
    startTransition(async () => {
      await addItemsToCart(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-muted-foreground/30 border-dashed bg-muted/40 p-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-sm">Vaša posledná objednávka</h3>
        <p className="text-muted-foreground text-xs">
          {items.length} {items.length === 1 ? "položka" : "položiek"}
        </p>
      </div>

      {/* Items preview */}
      <div className="space-y-2">
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
              <p className="line-clamp-1 font-medium text-sm">{item.name}</p>
              <p className="text-muted-foreground text-xs">
                {item.quantity}x {formatPrice(item.priceCents)}
              </p>
            </div>
          </div>
        ))}

        {/* Show count of hidden items if any */}
        {hiddenItemCount > 0 && (
          <p className="py-1 text-center text-muted-foreground text-xs">
            +{hiddenItemCount} {`ďalš${hiddenItemCount === 1 ? "á" : "ích"}`}{" "}
            položk{hiddenItemCount === 1 ? "a" : "y"}
          </p>
        )}
      </div>

      <Separator className="my-2" />

      {/* Total and button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Celkom:</span>
          <span className="font-semibold">{formatPrice(totalPrice)}</span>
        </div>
        <Button
          className="w-full"
          disabled={isPending}
          onClick={handleRepeatOrder}
          size="sm"
          variant="default"
        >
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <span>Zopakovať objednávku</span>
              <ChevronRightIcon className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
