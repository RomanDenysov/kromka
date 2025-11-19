"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function useCreateDraftStore() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
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
