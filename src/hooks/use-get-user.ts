"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function useGetUser() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.public.users.me.queryOptions());
}
