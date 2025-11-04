"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useGetSuspenseProductById(id: string) {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.admin.products.byId.queryOptions({ id }));
}
