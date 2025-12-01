"use client";

import type { VariantProps } from "class-variance-authority";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  quantity: number;
  textSize?: string;
} & VariantProps<typeof buttonVariants>;

export function QuantitySetter({
  productId,
  quantity,
  size = "icon-xs",
  textSize = "text-sm",
  ...props
}: Props) {
  const { updateQuantity } = useCartActions();

  const [localQuantity, setLocalQuantity] = useState(quantity);
  // biome-ignore lint/style/noMagicNumbers: 500ms debounce
  const debouncedQuantity = useDebounce(localQuantity, 500);

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  useEffect(() => {
    if (debouncedQuantity !== quantity) {
      updateQuantity({ productId, quantity: debouncedQuantity });
    }
  }, [debouncedQuantity, quantity, productId, updateQuantity]);

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={() => setLocalQuantity((prev) => Math.max(0, prev - 1))}
        size={size}
        variant="outline"
        {...props}
      >
        <MinusIcon className="size-3" />
      </Button>
      <span className={cn("w-4 text-center", textSize)}>{localQuantity}</span>
      <Button
        onClick={() => setLocalQuantity((prev) => prev + 1)}
        size={size}
        variant="outline"
        {...props}
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
}
