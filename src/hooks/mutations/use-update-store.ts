"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { Store } from "@/types/store";

type Options = {
  onSuccess?: (updatedStore: Store) => void;
  onError?: (error?: Error) => void;
};

export function useUpdateStore(options: Options) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.admin.stores.update.mutationOptions({
      onSuccess: async (updatedStore) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.stores.byId.queryOptions({ id: updatedStore.id })
            .queryKey,
        });
        options.onSuccess?.(updatedStore);
      },
      onError: (error) => {
        // biome-ignore lint/suspicious/noConsole: TODO: Implement error handling
        console.error(error);
        options.onError?.();
      },
    })
  );
}
