"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { Store } from "@/types/store";

export function useSelectStore() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: stores, isLoading: isLoadingStores } = useQuery(
    trpc.public.stores.list.queryOptions()
  );
  const { data: user, isLoading: isLoadingUser } = useQuery(
    trpc.public.users.me.queryOptions()
  );
  const userDefaultStoreId = isLoadingUser ? null : (user?.storeId ?? null);

  const [selectedStore, setSelectedStore] = useState<Store | null>(
    userDefaultStoreId
      ? (stores?.find((store) => store.id === userDefaultStoreId) ?? null)
      : null
  );

  const { mutate: setStore, isPending } = useMutation(
    trpc.public.stores.setUserStore.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.public.users.me.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  useEffect(() => {
    if (userDefaultStoreId) {
      setSelectedStore(
        stores?.find((store) => store.id === userDefaultStoreId) ?? null
      );
    } else {
      setSelectedStore(null);
    }
  }, [userDefaultStoreId, stores]);

  return {
    stores,
    selectedStore,
    setSelectedStore,
    setStore,
    isLoading: isLoadingStores || isLoadingUser,
    isPending,
  };
}
