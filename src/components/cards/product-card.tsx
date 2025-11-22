"use client";

import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { AddToCartButton } from "../shared/add-to-cart-button";
import { Hint } from "../shared/hint";
import { ProductImage } from "../shared/product-image";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const MAX_CATEGORIES_DISPLAY = 3;

type Props = {
  product: RouterOutputs["public"]["products"]["list"][number];
};

export function ProductCard({ product }: Props) {
  const totalCategories = product.categories.length;
  const showingCategories = product.categories.slice(0, MAX_CATEGORIES_DISPLAY);

  return (
    <Link
      className="relative flex flex-col gap-2 overflow-hidden rounded-md bg-accent p-2"
      href={`/eshop/products/${product.slug}`}
      prefetch
    >
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            size="icon-sm"
            variant="ghost"
          >
            <HeartIcon className="size-5" />
          </Button>
        </div>
        <ProductImage
          alt={product.name}
          className="aspect-square rounded-sm object-cover transition-transform duration-300"
          src={product.images[0]}
        />
      </div>
      <div className="flex size-full flex-col justify-between gap-1 px-0.5">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-0.5">
          {showingCategories.map((category) => (
            <Badge key={category.id} size="xs" variant="outline">
              {category.name}
            </Badge>
          ))}
          {showingCategories.length < product.categories.length && (
            <Hint
              text={product.categories
                .slice(MAX_CATEGORIES_DISPLAY)
                .map((category) => category.name)
                .join(", ")}
            >
              <Badge size="xs" variant="outline">
                +{totalCategories - showingCategories.length}
              </Badge>
            </Hint>
          )}
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
          <AddToCartButton id={product.id} />
        </div>
      </div>
    </Link>
  );
}
