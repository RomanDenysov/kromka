"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function useCreateDraftCategory() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  // const { setParams } = useCategoryParams();
  return useMutation(
    trpc.admin.categories.createDraft.mutationOptions({
      onSuccess: async (newCategory) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.categories.list.queryKey(),
        });
        // setParams({ categoryId: newCategory.id });
        router.push(`/admin/categories/${newCategory.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
