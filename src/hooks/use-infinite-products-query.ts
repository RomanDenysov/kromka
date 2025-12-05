"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getProductsInfinite,
  type ProductsInfinite,
} from "@/lib/queries/products";

export function useInfiniteProductsQuery(
  input: {
    limit?: number;
    cursor?: number;
    categoryId?: string;
  },
  initialData?: ProductsInfinite
) {
  return useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam = 0 }) =>
      getProductsInfinite({ ...input, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [0],
        }
      : undefined,
  });
}
