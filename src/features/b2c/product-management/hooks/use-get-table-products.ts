"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useGetSuspenseTableProducts() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.admin.products.list.queryOptions());
}
