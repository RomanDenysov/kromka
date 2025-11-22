/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export function useCartActions() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: addToCart, isPending: isAddingToCart } = useMutation(
    trpc.public.cart.addToCart.mutationOptions({
      onMutate: async (newItem) => {
        await queryClient.cancelQueries({
          queryKey: trpc.public.cart.getCart.queryKey(),
        });
        const previousCart = queryClient.getQueryData(
          trpc.public.cart.getCart.queryKey()
        );

        // Optimistically update
        // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
        queryClient.setQueryData(
          trpc.public.cart.getCart.queryKey(),
          (old: any) => {
            if (!old) {
              return null;
            }

            // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
            const existingItem = old.items.find(
              // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
              (item: any) => item.productId === newItem.productId
            );

            if (existingItem) {
              return {
                ...old,
                // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
                items: old.items.map((item: any) =>
                  item.productId === newItem.productId
                    ? { ...item, quantity: item.quantity + newItem.quantity }
                    : item
                ),
              };
            }
            return old;
          }
        );

        return { previousCart };
      },
      onSuccess: () => {
        toast.success("Pridané do košíka");
        queryClient.invalidateQueries({
          queryKey: trpc.public.cart.getCart.queryKey(),
        });
      },
      onError: (error, _, context) => {
        toast.error("Nepodarilo sa pridať do košíka");
        queryClient.setQueryData(
          trpc.public.cart.getCart.queryKey(),
          context?.previousCart
        );
        // biome-ignore lint/suspicious/noConsole: Error reporting
        console.error(error);
      },
    })
  );

  const { mutate: removeFromCart, isPending: isRemovingFromCart } = useMutation(
    trpc.public.cart.removeFromCart.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.public.cart.getCart.queryKey(),
        });
        const previousCart = queryClient.getQueryData(
          trpc.public.cart.getCart.queryKey()
        );

        // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
        queryClient.setQueryData(
          trpc.public.cart.getCart.queryKey(),
          (old: any) => {
            if (!old) {
              return null;
            }
            return {
              ...old,
              // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
              items: old.items.filter(
                // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
                (item: any) => item.productId !== variables.productId
              ),
            };
          }
        );

        return { previousCart };
      },
      onSuccess: () => {
        toast.success("Odstránené z košíka");
        queryClient.invalidateQueries({
          queryKey: trpc.public.cart.getCart.queryKey(),
        });
      },
      onError: (error, _, context) => {
        toast.error("Nepodarilo sa odstrániť z košíka");
        queryClient.setQueryData(
          trpc.public.cart.getCart.queryKey(),
          context?.previousCart
        );
        // biome-ignore lint/suspicious/noConsole: Error reporting
        console.error(error);
      },
    })
  );

  const { mutate: updateQuantity, isPending: isUpdatingQuantity } = useMutation(
    trpc.public.cart.updateQuantity.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.public.cart.getCart.queryKey(),
        });
        const previousCart = queryClient.getQueryData(
          trpc.public.cart.getCart.queryKey()
        );

        // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
        queryClient.setQueryData(
          trpc.public.cart.getCart.queryKey(),
          (old: any) => {
            if (!old) {
              return null;
            }
            return {
              ...old,
              // biome-ignore lint/suspicious/noExplicitAny: Optimistic update payload is partial
              items: old.items
                .map((item: any) =>
                  item.productId === variables.productId
                    ? { ...item, quantity: variables.quantity }
                    : item
                )
                .filter((item: any) => item.quantity > 0),
            };
          }
        );

        return { previousCart };
      },
      onSuccess: () => {
        // Silent success for quantity updates to avoid spamming toasts
        queryClient.invalidateQueries({
          queryKey: trpc.public.cart.getCart.queryKey(),
        });
      },
      onError: (error, _, context) => {
        toast.error("Nepodarilo sa aktualizovať množstvo");
        queryClient.setQueryData(
          trpc.public.cart.getCart.queryKey(),
          context?.previousCart
        );
        // biome-ignore lint/suspicious/noConsole: Error reporting
        console.error(error);
      },
    })
  );

  return {
    addToCart,
    isAddingToCart,
    removeFromCart,
    isRemovingFromCart,
    updateQuantity,
    isUpdatingQuantity,
  };
}
