"use client";

import { formatPrice } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { ProductImage } from "../shared/product-image";

const MAX_CATEGORIES_DISPLAY = 3;

const CENTS_PER_UNIT = 100;

type Props = {
  product: RouterOutputs["public"]["products"]["list"][number];
};

export function ProductCard({ product }: Props) {
  return (
    <div className="relative aspect-square size-60 overflow-hidden rounded-sm bg-muted">
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      <ProductImage
        alt={product.name}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        src={product.images[0]}
      />
      <div className="absolute right-0 bottom-0 left-0 p-4">
        <h3 className="font-bold text-lg">{product.name}</h3>
        <p className="text-muted-foreground text-sm">
          {product.categories
            .slice(0, MAX_CATEGORIES_DISPLAY)
            .map((c) => c.name)
            .join(", ")}
          {product.categories.length > MAX_CATEGORIES_DISPLAY && (
            <span className="text-muted-foreground text-sm">
              +{product.categories.length - MAX_CATEGORIES_DISPLAY}
            </span>
          )}
        </p>
        {product.prices.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {formatPrice(product.prices[0].amountCents / CENTS_PER_UNIT || 0)}
          </p>
        )}
      </div>
    </div>
  );
}
