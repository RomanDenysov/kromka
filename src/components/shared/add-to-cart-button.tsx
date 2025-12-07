"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTransition } from "react";
import type { Product } from "@/lib/queries/products";
import { useCart } from "../cart/cart-context";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

export function AddToCartButton({
  disabled = false,
  product,
}: {
  disabled?: boolean;
  product: Product;
}) {
  const { addToCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      addToCart(product.id, 1, product);
    });
  };

  return (
    <Button
      className="z-10 w-full md:w-auto"
      disabled={isPending || disabled}
      onClick={handleClick}
      size="sm"
    >
      {isPending ? <Spinner /> : <ShoppingCartIcon />}
      <span>Do košíka</span>
    </Button>
  );
}
