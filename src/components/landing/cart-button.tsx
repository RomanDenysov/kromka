"use client";

import { ShoppingCartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function CartButton() {
  // TODO: Implement cart state management and right-side drawer
  const cartItemsCount = 10;

  return (
    <Button className="relative" size="icon-sm" variant="ghost">
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
