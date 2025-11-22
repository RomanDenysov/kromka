"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useGetCart() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.public.cart.getCart.queryOptions());
}
