"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useCartActions } from "@/hooks/use-cart-actions";
import { Button } from "../ui/button";

export function AddToCartButton({ id }: { id: string }) {
  const { addToCart, isAddingToCart } = useCartActions();

  return (
    <Button
      disabled={isAddingToCart}
      onClick={() => addToCart({ productId: id, quantity: 1 })}
    >
      <ShoppingCartIcon className="mr-2 size-4" />
      <span>Do košíka</span>
    </Button>
  );
}
