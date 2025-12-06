"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/lib/actions/cart";
import { useSession } from "@/lib/auth/client";

export function useGetCart() {
  const { data: session, isPending } = useSession();

  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!session && !isPending,
    staleTime: 0,
  });
}
