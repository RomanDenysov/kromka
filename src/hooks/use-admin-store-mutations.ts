"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TableStore } from "@/components/tables/stores/table";
import { useTRPC } from "@/trpc/client";

export function useCreateDraftStore() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  // TODO: Add feature flag to disable/enable drawer navigation after creating a draft store
  // const { setParams } = useStoreParams();
  return useMutation(
    trpc.admin.stores.createDraft.mutationOptions({
      onSuccess: async (newStore) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.stores.list.queryKey(),
        });
        // setParams({ storeId: newStore.id });
        router.push(`/admin/stores/${newStore.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}

export function useToggleStore() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.stores.list.queryKey();
  return useMutation(
    trpc.admin.stores.toggleIsActive.mutationOptions({
      onMutate: ({ ids }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousStores = queryClient.getQueryData(queryKey);
        if (previousStores) {
          queryClient.setQueryData<TableStore[]>(queryKey, (old) =>
            old?.map((store) =>
              ids.includes(store.id)
                ? {
                    ...store,
                    isActive: !store.isActive,
                  }
                : store
            )
          );
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
}

export function useCopyStore() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.stores.list.queryKey();
  return useMutation(
    trpc.admin.stores.copyStore.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );
}

export function useDeleteStore() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.stores.list.queryKey();
  return useMutation(
    trpc.admin.stores.deleteStore.mutationOptions({
      onMutate: ({ ids }) => {
        queryClient.cancelQueries({
          queryKey,
        });
        const previousStores = queryClient.getQueryData(queryKey);
        if (previousStores) {
          queryClient.setQueryData<TableStore[]>(queryKey, (old) =>
            old?.filter((store) => !ids.includes(store.id))
          );
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
