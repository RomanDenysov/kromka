"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getProductsInfinite,
  type ProductsInfinite,
} from "@/lib/queries/products";

type UseInfiniteProductsInput = {
  limit?: number;
  categorySlug?: string;
};

export function useInfiniteProductsQuery(
  input: UseInfiniteProductsInput,
  initialData?: ProductsInfinite
) {
  const { categorySlug } = input;

  return useInfiniteQuery({
    queryKey: ["products", { categorySlug }],
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
