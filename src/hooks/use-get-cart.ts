"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/client";
import { useTRPC } from "@/trpc/client";

export function useGetCart() {
  const trpc = useTRPC();
  const { data: session, isPending } = useSession();

  const queryOptions = trpc.public.cart.getCart.queryOptions();

  return useQuery({
    ...queryOptions,
    enabled: !!session && !isPending,
  });
}
