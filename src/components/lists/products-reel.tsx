"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTRPC } from "@/trpc/client";
import { ProductCard } from "../cards/product-card";
import { LoadMore } from "../shared/load-more";

type Props = {
  limit: number;
};

export function ProductsReel({ limit }: Props) {
  const trpc = useTRPC();
  const infiniteQueryOptions =
    trpc.public.products.infinite.infiniteQueryOptions(
      {
        limit,
      },
      {
        getNextPageParam: ({ nextCursor }) => nextCursor,
      }
    );
  const { data, fetchNextPage, hasNextPage, isFetching } =
    useSuspenseInfiniteQuery(infiniteQueryOptions);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log("products", data.pages);
  }, [data.pages]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {data.pages
          .flatMap((page) => page.data)
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
      <LoadMore hasNextPage={hasNextPage} isFetching={isFetching} ref={ref} />
    </div>
  );
}
