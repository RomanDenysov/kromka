"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { QuantitySetter } from "./quantity-setter";

type CartItem = NonNullable<
  NonNullable<RouterOutputs["public"]["cart"]["getCart"]>["items"]
>[number];

type Props = {
  item: CartItem;
};

export function ProductCartListItem({ item }: Props) {
  const { product, quantity } = item;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Image
          alt={product.name}
          className="rounded-md"
          height={50}
          quality={65}
          src={product.images[0].url ?? ""}
          width={50}
        />
        <div className="flex flex-1 flex-col gap-1">
          <span className="font-medium text-sm">{product.name}</span>
          <span className="text-muted-foreground text-xs">
            {formatPrice(product.priceCents)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-medium text-sm">
          {formatPrice(product.priceCents * quantity)}
        </span>
        <QuantitySetter productId={product.id} quantity={quantity} />
      </div>
    </div>
  );
}
