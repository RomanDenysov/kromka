"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useStoreParams } from "./use-store-params";

export function useCreateDraftStore() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { setParams } = useStoreParams();
  return useMutation(
    trpc.admin.stores.createDraft.mutationOptions({
      onSuccess: async (newStore) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.stores.list.queryKey(),
        });
        setParams({ storeId: newStore.id });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
