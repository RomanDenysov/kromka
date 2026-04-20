"use client";

import {
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { use, useEffect, useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Hint } from "@/components/shared/hint";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import type { LastOrderWithItems } from "@/features/checkout/api/queries";
import { useIsMobile } from "@/hooks/use-mobile";
import { analytics } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { useBuyAgainOrder } from "../hooks/use-buy-again-order";

export function ReorderBar({
  lastOrderPromise,
}: {
  lastOrderPromise: Promise<LastOrderWithItems | null>;
}) {
  const lastOrder = use(lastOrderPromise);

  const items = lastOrder?.items ?? [];
  const { visible, init, dismiss } = useBuyAgainOrder();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(items);
  const { isPending, repeatOrder } = useBuyAgainOrder(() => setOpen(false));

  useEffect(init, [init]);

  const totalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  const selectedCents = selectedItems.reduce(
    (s, i) => s + i.priceCents * i.quantity,
    0
  );
  const maxThumbs = isMobile ? 3 : 6;
  const extra = items.length - maxThumbs;

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setSelectedItems(items);
    }
  };

  if (!(visible && lastOrder) || items.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="rounded-sm border bg-background shadow-sm"
        exit={{ y: "-100%" }}
        initial={{ y: "-100%", opacity: 0 }}
        transition={{ type: "tween", duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <Hint text="Vaša posledná objednávka">
            <span className="flex shrink-0 items-center gap-1 font-mono font-semibold text-xs">
              <ShoppingCartIcon className="size-4" />
              {formatPrice(totalCents)}
            </span>
          </Hint>

          <button
            className="flex items-center transition-opacity hover:opacity-80"
            onClick={() => setOpen(true)}
            type="button"
          >
            {items.slice(0, maxThumbs).map((item) => (
              <ProductImage
                alt={item.name}
                className="-mr-1.5 size-7 rounded-md object-cover ring-1 ring-ring"
                height={32}
                key={item.productId}
                src={item.imageUrl ?? "/images/cooperation.jpg"}
                width={32}
              />
            ))}
            {extra > 0 && (
              <span className="flex size-7 items-center justify-center rounded-md bg-muted font-medium text-primary text-xs ring-1 ring-ring">
                +{extra}
              </span>
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              disabled={isPending}
              onClick={() => repeatOrder(items, "reorder_bar")}
              size="xs"
              variant="brand"
            >
              {isPending ? <Spinner /> : <ShoppingBagIcon />}
              Objednat
            </Button>

            <Button
              aria-label="Skryt panel"
              onClick={() => {
                analytics.buyAgainDismissed();
                dismiss();
              }}
              size="icon-xs"
              variant="ghost"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      </motion.div>
      <ResponsiveModal
        footer={
          <OrderFooter
            disabled={selectedItems.length === 0}
            isPending={isPending}
            onOrder={() => repeatOrder(selectedItems, "reorder_bar")}
            total={selectedCents}
          />
        }
        onOpenChange={handleOpenChange}
        open={open}
        title="Vaš posledný nákup"
      >
        <ItemsList items={selectedItems} onChange={setSelectedItems} />
      </ResponsiveModal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ItemsList({
  items,
  onChange,
}: {
  items: LastOrderWithItems["items"];
  onChange: (items: LastOrderWithItems["items"]) => void;
}) {
  const updateQty = (id: string, delta: number) =>
    onChange(
      items.map((i) =>
        i.productId === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );

  const remove = (id: string) =>
    onChange(items.filter((i) => i.productId !== id));

  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-muted-foreground text-sm">
        Žiadne položky
      </p>
    );
  }

  return (
    <ScrollArea className="h-[60vh]">
      <div className="flex flex-col gap-1 px-4 sm:px-2">
        {items.map((item) => (
          <div
            className="flex w-full items-center gap-2 rounded-lg py-2 hover:bg-muted/50 sm:gap-3 sm:pr-2"
            key={item.productId}
          >
            <ProductImage
              alt={item.name}
              className="size-12 shrink-0 rounded-lg object-cover sm:size-14"
              height={56}
              src={item.imageUrl ?? "/images/cooperation.jpg"}
              width={56}
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-medium text-sm leading-tight sm:line-clamp-1">
                {item.name}
              </p>
              <span className="text-muted-foreground text-xs">
                {formatPrice(item.priceCents * item.quantity)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                disabled={item.quantity <= 1}
                onClick={() => updateQty(item.productId, -1)}
                size="icon-xs"
                variant="outline"
              >
                <MinusIcon className="size-3" />
              </Button>
              <span className="w-5 text-center font-medium text-sm tabular-nums">
                {item.quantity}
              </span>
              <Button
                onClick={() => updateQty(item.productId, 1)}
                size="icon-xs"
                variant="outline"
              >
                <PlusIcon className="size-3" />
              </Button>
            </div>

            <Button
              aria-label={`Odstranit ${item.name}`}
              className="hover:bg-destructive/10 hover:text-destructive"
              onClick={() => remove(item.productId)}
              size="icon-xs"
              variant="ghost"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function OrderFooter({
  disabled,
  isPending,
  onOrder,
  total,
}: {
  disabled: boolean;
  isPending: boolean;
  onOrder: () => void;
  total: number;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-muted-foreground text-xs">Celkom:</span>
        <span className="font-semibold text-sm">{formatPrice(total)}</span>
      </div>
      <Button
        className="flex-1"
        disabled={isPending || disabled}
        onClick={onOrder}
      >
        {isPending ? (
          <Spinner className="size-4" />
        ) : (
          <ShoppingCartIcon className="size-4" />
        )}
        Pridat do kosika
      </Button>
    </div>
  );
}
