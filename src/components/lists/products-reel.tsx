"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useEshopParams } from "@/hooks/use-eshop-params";
import { useInfiniteProductsQuery } from "@/hooks/use-infinite-products-query";
import type { ProductsInfinite } from "@/lib/queries/products";
import { cn } from "@/lib/utils";
import { ProductCard } from "../cards/product-card";
import { ProductCardSkeleton } from "../cards/product-card-skeleton";
import { LoadMore } from "../shared/load-more";

const STAGGER_DELAY_MS = 75;

type Props = {
  limit: number;
  className?: string;
  initialData?: ProductsInfinite;
};

export function ProductsReel({ limit, className, initialData }: Props) {
  const { category: categoryId } = useEshopParams();

  // Track rendered products to only animate newly loaded ones
  const prevCategoryRef = useRef(categoryId);
  const renderedCountRef = useRef(0);

  // Reset animation tracking when category changes
  if (prevCategoryRef.current !== categoryId) {
    renderedCountRef.current = 0;
    prevCategoryRef.current = categoryId;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProductsQuery(
      { limit, categoryId: categoryId || undefined },
      initialData
    );

  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data?.pages]
  );

  // Capture count before render for animation calculation
  const animateFromIndex = renderedCountRef.current;

  // Update rendered count after products change
  useEffect(() => {
    renderedCountRef.current = products.length;
  }, [products.length]);

  return (
    <div className={cn("flex size-full flex-col gap-4", className)}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => {
          const isNewItem = index >= animateFromIndex;
          const animationDelay = isNewItem
            ? (index - animateFromIndex) * STAGGER_DELAY_MS
            : 0;

          return (
            <ProductCard
              animationDelay={animationDelay}
              key={product.id}
              product={product}
            />
          );
        })}
        {isFetchingNextPage &&
          Array.from({ length: limit }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
          ))}
      </div>
      <LoadMore
        hasNextPage={hasNextPage}
        isFetching={isFetchingNextPage}
        ref={ref}
      />
    </div>
  );
}

export function ProductsReelSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
      ))}
    </div>
  );
}
