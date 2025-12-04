"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { CartProduct } from "@/types/cart";
import { QuantitySetter } from "./quantity-setter";

type Props = {
  product: CartProduct;
  quantity: number;
};

export function ProductCartListItem({ product, quantity }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Image
          alt={product.name}
          className="aspect-square rounded-sm object-cover"
          height={60}
          quality={65}
          src={product.images[0]?.url || "/images/doors.jpg"}
          width={60}
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
