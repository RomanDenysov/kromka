"use client";

import { HeartIcon } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/queries/products";
import { cn, formatPrice } from "@/lib/utils";
import { ImageSlider } from "../image-slider";
import { AddToCartButton } from "../shared/add-to-cart-button";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type Props = {
  product: Product;
  className?: string;
  preload?: boolean;
};

export function ProductCard({ product, className, preload = false }: Props) {
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
          <div className="absolute top-2 right-2 z-20">
            <Button size="icon-sm" type="button" variant="ghost">
              <HeartIcon className="size-5" />
            </Button>
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
