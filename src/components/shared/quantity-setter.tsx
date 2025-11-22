"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useDebounce } from "@/hooks/use-debounce";

type Props = {
  productId: string;
  quantity: number;
};

export function QuantitySetter({ productId, quantity }: Props) {
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
        size="icon-xs"
        variant="outline"
      >
        <MinusIcon className="size-3" />
      </Button>
      <span className="w-4 text-center text-sm">{localQuantity}</span>
      <Button
        onClick={() => setLocalQuantity((prev) => prev + 1)}
        size="icon-xs"
        variant="outline"
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
}
