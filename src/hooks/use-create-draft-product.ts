"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useProductParams } from "./use-product-params";

export function useCreateDraftProduct() {
  const trpc = useTRPC();
  const { setParams } = useProductParams();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.admin.products.createDraft.mutationOptions({
      onSuccess: async (newProduct) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.products.list.queryKey(),
        });
        setParams({ productId: newProduct.id });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
