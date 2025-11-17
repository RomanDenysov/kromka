"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function useCreateDraftProduct() {
  const router = useRouter();
  const trpc = useTRPC();
  // const { setParams } = useProductParams();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.admin.products.createDraft.mutationOptions({
      onSuccess: async ({ id }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.products.list.queryKey(),
        });
        router.push(`/admin/products/${id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
