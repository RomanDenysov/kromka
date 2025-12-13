"use client";

import Link from "next/link";
import type { Product } from "@/lib/queries/products";
import { cn, formatPrice } from "@/lib/utils";
import { FavoriteButton } from "../favorites/favorite-button";
import { ImageSlider } from "../image-slider";
import { AddToCartButton } from "../shared/add-to-cart-button";
import { Badge } from "../ui/badge";

type Props = {
  product: Product;
  className?: string;
  preload?: boolean;
  isFavorite?: boolean;
};

export function ProductCard({
  product,
  className,
  preload = false,
  isFavorite,
}: Props) {
  const isActive = product.status === "active";

  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-md p-0.5",
        className
      )}
      title={isActive ? product.name : `${product.name} (neaktívny produkt)`}
    >
      <Link href={`/product/${product.slug}`} prefetch>
        <div className="relative">
          <div className="absolute top-1 right-1 z-20 md:top-2 md:right-2">
            <FavoriteButton
              className="hover:bg-accent/50 [&_svg:not([class*='size-'])]:size-5"
              initialIsFavorite={isFavorite}
              productId={product.id}
              size="icon"
              variant="ghost"
            />
          </div>
          <ImageSlider
            disabled={!isActive}
            preload={preload}
            urls={product.images}
          />
        </div>
      </Link>
      <div className="flex size-full flex-col justify-between gap-2 px-1 pb-1">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-0.5">
          {product.category ? (
            <Badge size="xs" variant="outline">
              {product.category.name}
            </Badge>
          ) : null}
        </div>

        {/* Name */}

        <h3 className="line-clamp-2 font-semibold text-base">{product.name}</h3>

        {/* Spacer */}
        <div className="h-full flex-1" />

        {/* Price */}
        <div className="mt-auto flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <span className="flex-1 font-bold text-base">
            {formatPrice(product.priceCents)}
          </span>

          <AddToCartButton disabled={!isActive} id={product.id} />
        </div>
      </div>
    </article>
  );
}
