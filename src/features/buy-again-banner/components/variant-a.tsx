"use client";

import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { addItemsToCart } from "@/features/cart/api/actions";
import type { LastOrderWithItems } from "@/features/checkout/api/queries";
import { analytics } from "@/lib/analytics";
import { getItemCountString } from "@/lib/item-count-string";
import { formatPrice } from "@/lib/utils";

const DISMISS_KEY = "buy-again-dismissed";

interface Props {
  items: LastOrderWithItems["items"];
}

export function BuyAgainBannerClient({ items }: Props) {
  const [isPending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(items);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
    }
  }, []);

  if (dismissed) {
    return null;
  }

  const totalPriceCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleAddToCart = (itemsToAdd: LastOrderWithItems["items"]) => {
    const total = itemsToAdd.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );
    startTransition(async () => {
      await addItemsToCart(
        itemsToAdd.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );
      analytics.orderRepeated({
        item_count: itemsToAdd.length,
        total,
      });
      setDialogOpen(false);
    });
  };

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-[#e4ddd5] bg-[#faf8f5] px-4 py-4 shadow shadow-accent sm:gap-4 sm:px-6 sm:py-5">
      {/* X dismiss */}
      <button
        aria-label="Skryt banner"
        className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:top-2.5 sm:right-2.5"
        onClick={handleDismiss}
        type="button"
      >
        <XIcon className="size-4 sm:size-5" />
      </button>

      {/* Title + price/count */}
      <div className="flex flex-col gap-0.5 pr-8">
        <h2 className="font-semibold text-base sm:text-xl">
          Vas posledny nakup
        </h2>
        <p className="text-muted-foreground text-sm">
          {formatPrice(totalPriceCents)} - {getItemCountString(items.length)}
        </p>
      </div>

      {/* Bottom row: thumbnails left, button right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Dialog
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open) {
              setSelectedItems(items);
            }
          }}
          open={dialogOpen}
        >
          {/* Thumbnails - clickable to open dialog */}
          <DialogTrigger asChild>
            <div className="flex items-center rounded-lg transition-opacity hover:opacity-80">
              {items.slice(0, 5).map((item) => (
                <ProductImage
                  alt={item.name}
                  className="-mr-1 size-14 rounded-lg object-cover ring-1 ring-muted sm:size-16"
                  height={64}
                  key={item.productId}
                  src={item.imageUrl ?? "/images/cooperation.jpg"}
                  width={64}
                />
              ))}
              {items.length > 5 && (
                <span className="flex size-14 items-center justify-center rounded-xl bg-muted font-medium text-muted-foreground text-sm ring-2 ring-white sm:size-16">
                  +{items.length - 5}
                </span>
              )}
            </div>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vas posledny nakup</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="flex flex-col gap-2 py-2 pr-2.5">
                {selectedItems.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    key={item.productId}
                  >
                    <ProductImage
                      alt={item.name}
                      className="size-14 rounded-lg object-cover"
                      height={56}
                      src={item.imageUrl ?? "/images/cooperation.jpg"}
                      width={56}
                    />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <p className="line-clamp-1 font-medium text-sm">
                        {item.name}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        disabled={item.quantity <= 1}
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        size="icon-xs"
                        variant="outline"
                      >
                        <MinusIcon className="size-3" />
                      </Button>
                      <span className="w-6 text-center font-medium text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        size="icon-xs"
                        variant="outline"
                      >
                        <PlusIcon className="size-3" />
                      </Button>
                    </div>

                    <button
                      aria-label={`Odstranit ${item.name}`}
                      className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveItem(item.productId)}
                      type="button"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                ))}
                {selectedItems.length === 0 && (
                  <p className="py-4 text-center text-muted-foreground text-sm">
                    Ziadne polozky
                  </p>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Celkom:</span>
                  <span className="font-semibold text-sm">
                    {formatPrice(selectedTotal)}
                  </span>
                </div>
                <Button
                  className="flex-1"
                  disabled={isPending || selectedItems.length === 0}
                  onClick={() => handleAddToCart(selectedItems)}
                  size="lg"
                >
                  {isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <ShoppingCartIcon className="size-4" />
                  )}
                  Pridat do kosika
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Button - adds all items directly */}
        <Button
          className="w-full sm:w-auto sm:min-w-48"
          disabled={isPending}
          onClick={() => handleAddToCart(items)}
          size="lg"
          variant="brand"
        >
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <ShoppingCartIcon className="size-4" />
          )}
          Pridat do kosika
        </Button>
      </div>
    </div>
  );
}
