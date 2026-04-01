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
import { type ReactNode, useEffect, useState } from "react";
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
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import type { LastOrderWithItems } from "@/features/checkout/api/queries";
import { useIsMobile } from "@/hooks/use-mobile";
import { analytics } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { useBuyAgainOrder } from "../hooks/use-buy-again-order";
import {
  useBuyAgainDismiss,
  useBuyAgainInit,
  useBuyAgainVisible,
} from "../store";

// ---------------------------------------------------------------------------
// Responsive modal: Drawer on mobile, Dialog on desktop
// ---------------------------------------------------------------------------

function ResponsiveModal({
  children,
  content,
  isMobile,
  onOpenChange,
  open,
}: {
  children: ReactNode;
  content: ReactNode;
  isMobile: boolean;
  onOpenChange: (v: boolean) => void;
  open: boolean;
}) {
  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        {content}
      </Drawer>
    );
  }
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {content}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
  items: LastOrderWithItems["items"];
}

export function ReorderBar({ items }: Props) {
  const visible = useBuyAgainVisible();
  const init = useBuyAgainInit();
  const dismiss = useBuyAgainDismiss();
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const modalContent = isMobile ? (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Vas posledny nakup</DrawerTitle>
      </DrawerHeader>
      <ScrollArea className="max-h-[60vh] overflow-y-auto">
        <ItemsList items={selectedItems} onChange={setSelectedItems} />
      </ScrollArea>
      <DrawerFooter>
        <OrderFooter
          disabled={selectedItems.length === 0}
          isPending={isPending}
          onOrder={() => repeatOrder(selectedItems, "reorder_bar")}
          total={selectedCents}
        />
      </DrawerFooter>
    </DrawerContent>
  ) : (
    <DialogContent className="p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle>Vas posledny nakup</DialogTitle>
      </DialogHeader>
      <ScrollArea className="-mx-4 max-h-[60vh] sm:-mx-6">
        <ItemsList items={selectedItems} onChange={setSelectedItems} />
      </ScrollArea>
      <DialogFooter>
        <OrderFooter
          disabled={selectedItems.length === 0}
          isPending={isPending}
          onOrder={() => repeatOrder(selectedItems, "reorder_bar")}
          total={selectedCents}
        />
      </DialogFooter>
    </DialogContent>
  );

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      animate={{ y: 0 }}
      className="border-border border-b bg-background"
      exit={{ y: "-100%" }}
      initial={{ y: "-100%" }}
      transition={{ type: "tween", duration: 0.3 }}
    >
      <div className="flex h-10 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 font-medium text-sm md:inline">
          Vas posledny nakup
        </span>

        <span className="flex shrink-0 items-center gap-1 font-semibold text-foreground text-sm">
          <ShoppingCartIcon className="size-3.5" />
          {formatPrice(totalCents)}
        </span>

        <ResponsiveModal
          content={modalContent}
          isMobile={isMobile}
          onOpenChange={handleOpenChange}
          open={open}
        >
          <button
            className="flex items-center transition-opacity hover:opacity-80"
            type="button"
          >
            {items.slice(0, maxThumbs).map((item) => (
              <ProductImage
                alt={item.name}
                className="-mr-1 size-8 rounded-md object-cover ring-1 ring-[#e4ddd5]"
                height={32}
                key={item.productId}
                src={item.imageUrl ?? "/images/cooperation.jpg"}
                width={32}
              />
            ))}
            {extra > 0 && (
              <span className="flex size-8 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs ring-1 ring-[#e4ddd5]">
                +{extra}
              </span>
            )}
          </button>
        </ResponsiveModal>

        <div className="ml-auto flex items-center gap-2">
          <Button
            className="hidden sm:inline-flex"
            disabled={isPending}
            onClick={() => repeatOrder(items, "reorder_bar")}
            size="sm"
            variant="brand"
          >
            {isPending ? (
              <Spinner className="size-3.5" />
            ) : (
              <ShoppingBagIcon className="size-3.5" />
            )}
            Objednat znova
          </Button>
          <Button
            aria-label="Objednat znova"
            className="sm:hidden"
            disabled={isPending}
            onClick={() => repeatOrder(items, "reorder_bar")}
            size="icon-sm"
            variant="brand"
          >
            {isPending ? (
              <Spinner className="size-4" />
            ) : (
              <ShoppingBagIcon className="size-5" />
            )}
          </Button>

          <button
            aria-label="Skryt panel"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => {
              analytics.buyAgainDismissed();
              dismiss();
            }}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
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
        Ziadne polozky
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2 sm:px-6">
      {items.map((item) => (
        <div
          className="flex items-center gap-2 rounded-lg py-2 hover:bg-muted/50 sm:gap-3 sm:px-2"
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

          <button
            aria-label={`Odstranit ${item.name}`}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:p-1.5"
            onClick={() => remove(item.productId)}
            type="button"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      ))}
    </div>
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
  );
}
