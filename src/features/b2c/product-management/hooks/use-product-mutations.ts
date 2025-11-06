"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type RouterOutputs, useTRPC } from "@/trpc/client";

type CreateDraftProductResult =
  RouterOutputs["admin"]["products"]["createDraft"];

type Options = {
  onSuccess?: (result: CreateDraftProductResult) => void;
  skipNavigation?: boolean;
};

export function useCreateDraftProduct({
  onSuccess,
  skipNavigation = false,
}: Options = {}) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation(
    trpc.admin.products.createDraft.mutationOptions({
      onSuccess: async (data) => {
        await qc.invalidateQueries({
          queryKey: trpc.admin.products.list.queryKey(),
        });
        if (!skipNavigation) {
          router.push(`/admin/b2c/products/${data.id}`);
        }
        onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
