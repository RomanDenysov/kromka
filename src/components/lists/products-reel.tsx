"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useEshopParams } from "@/hooks/use-eshop-params";
import { useTRPC } from "@/trpc/client";
import { ProductCard } from "../cards/product-card";
import { ProductCardSkeleton } from "../cards/product-card-skeleton";
import { LoadMore } from "../shared/load-more";

type Props = {
  limit: number;
};

export function ProductsReel({ limit }: Props) {
  const { category: categoryId } = useEshopParams();
  const trpc = useTRPC();
  const infiniteQueryOptions =
    trpc.public.products.infinite.infiniteQueryOptions(
      {
        limit,
        categoryId: categoryId || undefined,
      },
      {
        getNextPageParam: ({ nextCursor }) => nextCursor,
      }
    );
  const { data, fetchNextPage, hasNextPage, isFetching } =
    useSuspenseInfiniteQuery({ ...infiniteQueryOptions, initialPageParam: 0 });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.pages
          .flatMap((page) => page.data)
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        {isFetching &&
          hasNextPage &&
          Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i.toString()}`} />
          ))}
      </div>
      <LoadMore hasNextPage={hasNextPage} isFetching={isFetching} ref={ref} />
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
