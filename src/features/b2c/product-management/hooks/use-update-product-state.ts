"use client";

import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toggleProductState } from "../actions/toggle-product-state";
import type { Product } from "../ui/products-table";

export function useUpdateProductState() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const productMutationOptions: UseMutationOptions<void, Error, string> = {
    mutationFn: async (productId: string) => {
      await toggleProductState(productId);
    },
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
      ]);
      queryClient.setQueryData(["products"], (old: Product[]) =>
        old.map((product) =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        )
      );
      return { previousProducts };
    },
    onSuccess: () => {
      router.refresh();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  };

  return useMutation(productMutationOptions);
}
