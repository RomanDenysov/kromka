"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useCategoryParams } from "./use-category-params";

export function useCreateDraftCategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { setParams } = useCategoryParams();
  return useMutation(
    trpc.admin.categories.createDraft.mutationOptions({
      onSuccess: async (newCategory) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.categories.list.queryKey(),
        });
        setParams({ categoryId: newCategory.id });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
