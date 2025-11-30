"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import type {
  AddToCartParams,
  Cart,
  CartItem,
  ProductMeta,
} from "@/types/cart";

/**
 * Provides cart mutation actions with optimistic updates.
 * Pass `product` metadata to `addToCart` for instant UI updates on new items.
 */
export function useCartActions() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const cartQueryKey = useMemo(
    () => trpc.public.cart.getCart.queryKey(),
    [trpc]
  );

  // Refs to pass data to mutation callbacks
  const pendingProductRef = useRef<ProductMeta | undefined>(undefined);
  const pendingOnSuccessRef = useRef<(() => void) | undefined>(undefined);

  const { mutate: addToCartMutate, isPending: isAddingToCart } = useMutation(
    trpc.public.cart.addToCart.mutationOptions({
      onMutate: async (newItem) => {
        // Capture product metadata and clear ref
        const product = pendingProductRef.current;
        pendingProductRef.current = undefined;

        await queryClient.cancelQueries({ queryKey: cartQueryKey });
        const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);

        // No cart yet — let server create it
        if (!previousCart) {
          return { previousCart };
        }

        const existingItem = (previousCart.items ?? []).find(
          (item) => item.productId === newItem.productId
        );

        if (existingItem && previousCart.items) {
          // Update quantity for existing item
          const updatedItems = previousCart.items.map((item) =>
            item.productId === newItem.productId
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
          queryClient.setQueryData<Cart>(cartQueryKey, {
            ...previousCart,
            items: updatedItems,
          });
        } else if (product && previousCart.items) {
          // Add new item with product metadata
          const optimisticItem: CartItem = {
            productId: newItem.productId,
            quantity: newItem.quantity,
            price: product.priceCents,
            orderId: previousCart.id ?? "",
            productSnapshot: { name: product.name, price: product.priceCents },
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              priceCents: product.priceCents,
              images: product.imageUrl ? [{ url: product.imageUrl }] : [],
            },
          };
          queryClient.setQueryData<Cart>(cartQueryKey, {
            ...previousCart,
            items: [...previousCart.items, optimisticItem],
          });
        }

        return { previousCart };
      },
      onSuccess: () => {
        toast.success("Pridané do košíka");
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
        // Call user-provided onSuccess callback
        pendingOnSuccessRef.current?.();
        pendingOnSuccessRef.current = undefined;
      },
      onError: (error, _, context) => {
        toast.error("Nepodarilo sa pridať do košíka");
        if (context?.previousCart !== undefined) {
          queryClient.setQueryData<Cart>(cartQueryKey, context.previousCart);
        }
        // biome-ignore lint/suspicious/noConsole: Error reporting
        console.error("Add to cart failed:", error);
      },
    })
  );

  /**
   * Add item to cart with optional product metadata for optimistic UI.
   * When `product` is provided and item doesn't exist in cart,
   * it will appear immediately without waiting for server response.
   */
  const addToCart = useCallback(
    ({ productId, quantity, product, onSuccess }: AddToCartParams) => {
      // Store refs for mutation callbacks to use
      pendingProductRef.current = product;
      pendingOnSuccessRef.current = onSuccess;
      addToCartMutate({ productId, quantity });
    },
    [addToCartMutate]
  );

  const { mutate: removeFromCart, isPending: isRemovingFromCart } = useMutation(
    trpc.public.cart.removeFromCart.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: cartQueryKey });
        const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);

        if (!previousCart?.items) {
          return { previousCart };
        }

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: previousCart.items.filter(
            (item) => item.productId !== variables.productId
          ),
        });

        return { previousCart };
      },
      onSuccess: () => {
        toast.success("Odstránené z košíka");
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
      },
      onError: (error, _, context) => {
        toast.error("Nepodarilo sa odstrániť z košíka");
        if (context?.previousCart !== undefined) {
          queryClient.setQueryData<Cart>(cartQueryKey, context.previousCart);
        }
        // biome-ignore lint/suspicious/noConsole: Error reporting
        console.error("Remove from cart failed:", error);
      },
    })
  );

  const { mutate: updateQuantity, isPending: isUpdatingQuantity } = useMutation(
    trpc.public.cart.updateQuantity.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: cartQueryKey });
        const previousCart = queryClient.getQueryData<Cart>(cartQueryKey);

        if (!previousCart?.items) {
          return { previousCart };
        }

        const updatedItems =
          variables.quantity <= 0
            ? previousCart.items.filter(
                (item) => item.productId !== variables.productId
              )
            : previousCart.items.map((item) =>
                item.productId === variables.productId
                  ? { ...item, quantity: variables.quantity }
                  : item
              );

        queryClient.setQueryData<Cart>(cartQueryKey, {
          ...previousCart,
          items: updatedItems,
        });

        return { previousCart };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
      },
      onError: (error, _, context) => {
        toast.error("Nepodarilo sa aktualizovať množstvo");
        if (context?.previousCart !== undefined) {
          queryClient.setQueryData<Cart>(cartQueryKey, context.previousCart);
        }
        // biome-ignore lint/suspicious/noConsole: Error reporting
        console.error("Update quantity failed:", error);
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
