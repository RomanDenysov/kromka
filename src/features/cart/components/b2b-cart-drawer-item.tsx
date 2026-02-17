"use client";

import Link from "next/link";
import { ProductImage } from "@/components/shared/product-image";
import { QuantitySetter } from "@/components/shared/quantity-setter";
import { RemoveItemButton } from "@/features/checkout/components/remove-item-button";
import {
  removeFromB2bCart,
  updateB2bQuantity,
} from "@/features/cart/api/actions";
import type { DetailedCartItem } from "@/features/cart/api/queries";
import { formatPrice } from "@/lib/utils";

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
          <QuantitySetter
            id={item.productId}
            onUpdate={updateB2bQuantity}
            quantity={item.quantity}
          />
          <RemoveItemButton
            id={item.productId}
            onRemove={removeFromB2bCart}
            productInfo={{ name: item.name, quantity: item.quantity }}
            size="icon-xs"
          />
        </div>
      </div>
    </div>
  );
}
