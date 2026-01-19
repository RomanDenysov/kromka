import Link from "next/link";
import { Suspense } from "react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { AddToCartButton } from "@/components/shared/add-to-cart-button";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/features/products/api/queries";
import { cn, formatPrice } from "@/lib/utils";

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
      <Link href={`/product/${product.slug}`}>
        <div className="relative">
          <div className="absolute top-1 right-1 z-20 md:top-2 md:right-2">
            <Suspense>
              <FavoriteButton
                className="hover:bg-accent/50 [&_svg:not([class*='size-'])]:size-5"
                initialIsFavorite={isFavorite}
                productId={product.id}
                size="icon"
                variant="ghost"
              />
            </Suspense>
          </div>
          <ProductImage
            alt={`Product image: ${product.name}`}
            className={cn(
              "aspect-square size-full rounded-sm object-cover object-center transition-all duration-300"
            )}
            decoding="sync"
            height={500}
            loading={preload ? "eager" : "lazy"}
            preload={preload}
            quality={80}
            src={product.imageUrl ?? ""}
            width={500}
          />
        </div>
      </Link>
      <div className="flex size-full flex-col justify-between gap-1 px-1 pb-1">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-0.5">
          {product.category ? (
            <Badge size="xs" variant="outline">
              {product.category.name}
            </Badge>
          ) : null}
        </div>

        {/* Name */}

        <h3 className="line-clamp-2 font-semibold text-sm md:text-base">
          {product.name}
        </h3>

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

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-md p-0.5">
      <Skeleton className="aspect-square w-full rounded-sm" />
      <div className="flex flex-col gap-2 px-1 pb-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}
