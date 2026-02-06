"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import {
  removeFromB2bCart,
  updateB2bQuantity,
} from "@/features/cart/api/actions";
import type { DetailedCartItem } from "@/features/cart/api/queries";
import { cn, formatPrice } from "@/lib/utils";

const DEBOUNCE_DELAY = 400;

function B2bQuantitySetter({
  id,
  quantity,
}: {
  id: string;
  quantity: number;
}) {
  const [localQty, setLocalQty] = useState(quantity);
  const [isPending, startTransition] = useTransition();

  const syncToServer = useDebouncedCallback((newQty: number) => {
    startTransition(async () => {
      await updateB2bQuantity(id, newQty);
    });
  }, DEBOUNCE_DELAY);

  const handleChange = (newQty: number) => {
    setLocalQty(newQty);
    syncToServer(newQty);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        disabled={localQty <= 1 || isPending}
        onClick={() => handleChange(localQty - 1)}
        size="icon-xs"
        variant="outline"
      >
        <MinusIcon className="size-3" />
      </Button>
      <span className={cn("w-6 text-center text-sm tabular-nums")}>
        {localQty}
      </span>
      <Button
        disabled={localQty >= 100 || isPending}
        onClick={() => handleChange(localQty + 1)}
        size="icon-xs"
        variant="outline"
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
}

function B2bRemoveItemButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await removeFromB2bCart(id);
        });
      }}
      size="icon-xs"
      variant="ghost"
    >
      <TrashIcon className="size-4 text-muted-foreground" />
    </Button>
  );
}

type Props = {
  item: DetailedCartItem;
};

export function B2bCartDrawerItem({ item }: Props) {
  return (
    <div className="flex gap-3">
      <ProductImage
        alt={item.name}
        className="aspect-square size-20 rounded-sm object-cover"
        height={80}
        src={item.imageUrl ?? "/images/cooperation.jpg"}
        width={80}
      />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            className="line-clamp-2 font-medium text-sm hover:underline"
            href={`/product/${item.slug}`}
          >
            {item.name}
          </Link>
          <span className="text-muted-foreground text-sm">
            {formatPrice(item.priceCents)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <B2bQuantitySetter id={item.productId} quantity={item.quantity} />
          <B2bRemoveItemButton id={item.productId} />
        </div>
      </div>
    </div>
  );
}
