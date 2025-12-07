"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "../cart/cart-context";

type Props = {
  productId: string;
  quantity: number;
  size?: "icon-xs" | "icon" | "icon-sm" | "icon-lg";
  textSize?: string;
};

export function QuantitySetter({
  productId,
  quantity,
  size = "icon-xs",
  textSize = "text-sm",
}: Props) {
  const { updateQuantity } = useCart();

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={() => updateQuantity(productId, Math.max(0, quantity - 1))}
        size={size}
        variant="outline"
      >
        <MinusIcon className="size-3" />
      </Button>
      <span className={cn("w-6 text-center tabular-nums", textSize)}>
        {quantity}
      </span>
      <Button
        onClick={() => updateQuantity(productId, quantity + 1)}
        size={size}
        variant="outline"
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
}
