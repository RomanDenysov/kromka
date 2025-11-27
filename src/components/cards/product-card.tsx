"use client";

import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { ViewTransition } from "react";
import { cn, formatPrice } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { ImageSlider } from "../image-slider";
import { AddToCartButton } from "../shared/add-to-cart-button";
import { Hint } from "../shared/hint";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const MAX_CATEGORIES_DISPLAY = 3;

type Props = {
  product: RouterOutputs["public"]["products"]["list"][number];
  className?: string;
  /** Delay in ms before animation starts. 0 = no animation (already rendered). */
  animationDelay?: number;
};

export function ProductCard({ product, className, animationDelay = 0 }: Props) {
  const totalCategories = product.categories.length;
  const showingCategories = product.categories.slice(0, MAX_CATEGORIES_DISPLAY);
  const isActive = product.status === "active";

  const shouldAnimate = animationDelay > 0;

  return (
    <Link
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-md p-0.5",
        shouldAnimate &&
          "fade-in slide-in-from-bottom-4 animate-in fill-mode-backwards duration-300",
        className
      )}
      href={`/e-shop/${product.slug}`}
      prefetch
      style={
        shouldAnimate ? { animationDelay: `${animationDelay}ms` } : undefined
      }
      title={isActive ? product.name : `${product.name} (neaktívny produkt)`}
    >
      <div className="relative">
        <div className="absolute top-2 right-2 z-20">
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
        <ImageSlider disabled={!isActive} urls={product.images} />
      </div>
      <div className="flex size-full flex-col justify-between gap-2 px-1 pb-1">
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
        <ViewTransition name={`${product.slug}-name`}>
          <h3 className="line-clamp-2 font-semibold text-base">
            {product.name}
          </h3>
        </ViewTransition>

        {/* Spacer */}
        <div className="h-full flex-1" />

        {/* Price */}
        <div className="mt-auto flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <ViewTransition name={`${product.slug}-price`}>
            <span className="flex-1 font-bold text-base">
              {formatPrice(product.priceCents)}
            </span>
          </ViewTransition>
          <AddToCartButton
            disabled={!isActive}
            id={product.id}
            product={{
              id: product.id,
              name: product.name,
              priceCents: product.priceCents,
              slug: product.slug,
              imageUrl: product.images[0],
            }}
          />
        </div>
      </div>
    </Link>
  );
}
