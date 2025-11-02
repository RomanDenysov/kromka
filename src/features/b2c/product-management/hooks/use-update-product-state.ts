"use client";

import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toggleProductState } from "../actions/toggle-product-state";
import type { Product } from "../ui/products-table";

export function useUpdateProductState() {
  const queryClient = useQueryClient();

  const productMutationOptions: UseMutationOptions<
    void,
    Error,
    string,
    { previousProducts?: Product[] }
  > = {
    mutationFn: async (productId: string) => {
      await toggleProductState(productId);
    },
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
      ]);
      queryClient.setQueryData<Product[]>(["products"], (old) => {
        const list = old ?? [];
        return list.map((product) =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        );
      });
      return { previousProducts };
    },
    onError: (_err, _productId, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  };

  return useMutation(productMutationOptions);
}
