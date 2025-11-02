import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export function useSuspenseCategoriesQuery() {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.admin.categories.list.queryOptions());
}
