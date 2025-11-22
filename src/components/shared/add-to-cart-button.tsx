"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useCartActions } from "@/hooks/use-cart-actions";
import { Button } from "../ui/button";

export function AddToCartButton({ id }: { id: string }) {
  const { addToCart, isAddingToCart } = useCartActions();

  return (
    <Button
      className="z-10 w-full md:w-auto"
      disabled={isAddingToCart}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ productId: id, quantity: 1 });
      }}
      size="sm"
    >
      <ShoppingCartIcon />
      <span>Do košíka</span>
    </Button>
  );
}
