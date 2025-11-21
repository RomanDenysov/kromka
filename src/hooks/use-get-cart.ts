"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useGetCart() {
  const trpc = useTRPC();
  return useQuery(
    trpc.public.cart.getCart.queryOptions(undefined, {
      staleTime: 0,
    })
  );
}
