/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type { Product } from "../ui/products-table";

export function useCreateDraftProduct() {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const router = useRouter();

  const listKey = trpc.admin.products.list.queryKey();

  return useMutation(
    trpc.admin.products.createDraft.mutationOptions({
      onMutate: async () => {
        await qc.cancelQueries({ queryKey: listKey });
        const previous = qc.getQueryData<unknown[]>(listKey);

        const tempId = `temp-${Date.now()}`;
        const optimistic = {
          id: tempId,
          name: "New Product",
          isActive: false,
          status: "draft",
          prices: [],
          categories: [],
          images: [],
          // add any other fields your table expects
        };

        qc.setQueryData(listKey, (old: any) =>
          old ? [optimistic, ...old] : [optimistic]
        );

        return { previous, tempId };
      },

      onSuccess: ({ id }, _vars, ctx) => {
        qc.setQueryData(listKey, (old: Product[] | undefined) => {
          if (!old) {
            return old;
          }
          return old.map((p) => (p.id === ctx?.tempId ? { ...p, id } : p));
        });
        router.push(`/admin/b2c/products/${id}`);
      },

      onError: (error, _vars, ctx) => {
        if (ctx?.previous) {
          qc.setQueryData(listKey, ctx.previous as Product[]);
        }
        toast.error(error.message);
      },

      // Ensure data is fresh after navigation
      onSettled: () => {
        qc.invalidateQueries({ queryKey: listKey });
        // optional: remove router.refresh() to avoid full reload if invalidate is enough
      },
    })
  );
}
