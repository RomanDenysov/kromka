"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TableProduct } from "@/components/tables/products/table";
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

export function useToggleProducts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.admin.products.toggleIsActive.mutationOptions({
      onMutate: ({ id }) => {
        queryClient.cancelQueries({
          queryKey: trpc.admin.products.list.queryKey(),
        });
        const previousProducts = queryClient.getQueryData(
          trpc.admin.products.list.queryKey()
        );
        if (previousProducts) {
          queryClient.setQueryData<TableProduct[]>(
            trpc.admin.products.list.queryKey(),
            (old) =>
              old?.map((product) =>
                product.id === id
                  ? { ...product, isActive: !product.isActive }
                  : product
              )
          );
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.products.list.queryKey(),
        });
      },
    })
  );
}

export function useCopyProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(
    trpc.admin.products.copyProduct.mutationOptions({
      onSuccess: ({ id }) => {
        queryClient.invalidateQueries({
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

export function useDeleteProduct() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.admin.products.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.products.list.queryKey(),
        });
      },
    })
  );
}
