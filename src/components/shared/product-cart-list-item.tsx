"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { CartProduct } from "@/types/cart";
import { Badge } from "../ui/badge";
import { QuantitySetter } from "./quantity-setter";

type Props = {
  product: CartProduct;
  quantity: number;
  onClick?: () => void;
};

export function ProductCartListItem({ product, quantity, onClick }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex gap-2">
        <Image
          alt={product.name}
          className="aspect-square rounded-sm bg-muted object-cover object-center"
          height={60}
          quality={75}
          src={product.images[0] || "/images/sec.webp"}
          width={60}
        />

        <div className="flex grow flex-col items-start justify-between gap-1">
          <Link
            className="font-medium text-sm hover:underline"
            href={`/product/${product.slug}`}
            onClick={onClick}
          >
            {product.name}
          </Link>
          {product.category && (
            <Badge size="xs" variant="secondary">
              {product.category.name}
            </Badge>
          )}
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
