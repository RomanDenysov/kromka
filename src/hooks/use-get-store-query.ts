"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { Store, StoreList } from "@/types/store";

export function useGetStoreQuery(storeId: string | null) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useQuery(
    trpc.admin.stores.byId.queryOptions(
      // biome-ignore lint/style/noNonNullAssertion: storeId is guaranteed to be set
      { id: storeId! },
      {
        enabled: Boolean(storeId),
        staleTime: 0,
        initialData: (): Store | undefined => {
          const stores = queryClient
            .getQueriesData({
              queryKey: trpc.admin.stores.list.queryOptions().queryKey,
            })
            .flatMap(([_, data]) => (data as StoreList) ?? []);
          return stores.find((s) => s?.id === storeId) as Store | undefined;
        },
      }
    )
  );
}
