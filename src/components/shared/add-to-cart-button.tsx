"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useCartActions } from "@/hooks/use-cart-actions";
import type { ProductMeta } from "@/types/cart";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function AddToCartButton({
  id,
  disabled = false,
  product,
}: {
  id: string;
  disabled?: boolean;
  /** Optional product data for instant optimistic UI update */
  product?: ProductMeta;
}) {
  const { addToCart, isAddingToCart } = useCartActions();

  return (
    <Button
      className="z-10 w-full md:w-auto"
      disabled={isAddingToCart || disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ productId: id, quantity: 1, product });
      }}
      size="sm"
    >
      {isAddingToCart ? <Spinner /> : <ShoppingCartIcon />}
      <span>Do košíka</span>
    </Button>
  );
}
