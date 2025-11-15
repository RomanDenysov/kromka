"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { Category } from "@/types/categories";

type Options = {
  onSuccess?: (updatedCategory: Category) => void;
  onError?: (error?: Error) => void;
};

export function useUpdateCategory(options: Options) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.admin.categories.update.mutationOptions({
      onSuccess: async (updatedCategory) => {
        if (!updatedCategory) {
          return;
        }
        await queryClient.invalidateQueries({
          queryKey: [
            trpc.admin.categories.byId.queryOptions({ id: updatedCategory.id })
              .queryKey,
            trpc.admin.categories.list.queryOptions().queryKey,
          ],
        });
        options.onSuccess?.(updatedCategory);
      },
      onError: (error) => {
        // biome-ignore lint/suspicious/noConsole: TODO: Implement error handling
        console.error(error);
        options.onError?.();
      },
    })
  );
}
