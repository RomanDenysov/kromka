"use client";

import {
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getProducts } from "@/actions/products/queries";
import type { Product } from "../ui/products-table";

export function useGetTableProducts({
  initialData,
}: {
  initialData?: Product[];
}) {
  const productsQueryOptions: UseSuspenseQueryOptions<Product[]> = {
    queryKey: ["products"],
    queryFn: getProducts,
    initialData,
  };

  return useSuspenseQuery(productsQueryOptions);
}
