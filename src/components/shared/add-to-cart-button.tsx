"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTransition } from "react";
import { addToCart } from "@/lib/cart/actions";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type Props = {
  id: string;
  disabled?: boolean;
};

export function AddToCartButton({ id, disabled = false }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await addToCart(id, 1);
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

export function AddToCartButtonIcon({ id, disabled = false }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await addToCart(id, 1);
    });
  };

  return (
    <Button
      className="h-10 w-10 shrink-0 rounded-full bg-white text-black shadow-md transition-all hover:scale-105 hover:bg-white/90"
      disabled={isPending || disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }}
      size="icon"
    >
      {isPending ? (
        <Spinner className="size-5" />
      ) : (
        <ShoppingCartIcon className="size-5" />
      )}
      <span className="sr-only">Do košíka</span>
    </Button>
  );
}
