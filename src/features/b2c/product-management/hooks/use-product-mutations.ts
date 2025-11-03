"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function useCreateDraftProduct() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const router = useRouter();

  const listKey = trpc.admin.products.list.queryKey();

  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log("Mutation listKey:", listKey);
  return useMutation(
    trpc.admin.products.createDraft.mutationOptions({
      onSuccess: async ({ id }) => {
        await qc.invalidateQueries({ queryKey: listKey });
        await qc.refetchQueries({
          queryKey: listKey,
          type: "active",
          exact: true,
        });
        router.push(`/admin/b2c/products/${id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
}
