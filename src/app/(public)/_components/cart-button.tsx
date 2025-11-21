"use client";

import { ShoppingCartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/use-cart-store";

export function CartButton() {
  const setOpenCart = useCartStore((state) => state.setOpen);
  // TODO: Get cart items count

  const cartItemsCount = 0;

  return (
    <Button
      className="relative"
      onClick={() => setOpenCart(true)}
      size="icon-sm"
      variant="ghost"
    >
      <ShoppingCartIcon className="size-5" />
      <span className="sr-only">Košík</span>
      {cartItemsCount > 0 && (
        <Badge
          className="-top-1.5 -right-1.5 absolute h-4 px-0.5 py-0 text-[10px]"
          variant="default"
        >
          {cartItemsCount}
        </Badge>
      )}
    </Button>
  );
}
