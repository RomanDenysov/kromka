"use client";

import { formatPrice } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { AddToCartButton } from "../shared/add-to-cart-button";
import { Hint } from "../shared/hint";
import { ProductImage } from "../shared/product-image";
import { Badge } from "../ui/badge";

const MAX_CATEGORIES_DISPLAY = 3;

const _CENTS_PER_UNIT = 100;

type Props = {
  product: RouterOutputs["public"]["products"]["list"][number];
};

export function ProductCard({ product }: Props) {
  return (
    <div className="relative flex flex-col gap-2 overflow-hidden rounded-md bg-accent p-2">
      <ProductImage
        alt={product.name}
        className="aspect-square rounded-sm object-cover transition-transform duration-300"
        src={product.images[0]}
      />
      <div className="flex flex-col gap-2 px-0.5">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-0.5">
          {product.categories
            .slice(0, MAX_CATEGORIES_DISPLAY)
            .map((category) => (
              <Badge key={category.id} size="xs" variant="outline">
                {category.name}
              </Badge>
            ))}
          {product.categories.length > MAX_CATEGORIES_DISPLAY && (
            <Hint
              text={product.categories
                .slice(MAX_CATEGORIES_DISPLAY)
                .map((category) => category.name)
                .join(", ")}
            >
              <Badge size="xs" variant="outline">
                +{product.categories.length - MAX_CATEGORIES_DISPLAY}
              </Badge>
            </Hint>
          )}
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 font-semibold text-sm">{product.name}</h3>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-bold text-base">
            {formatPrice(product.priceCents)}
          </span>
          <AddToCartButton id={product.id} />
        </div>
      </div>
    </div>
  );
}
