"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { updateQuantity } from "@/features/cart/api/actions";
import { cn } from "@/lib/utils";

const DEBOUNCE_DELAY = 400;

type Props = {
  id: string;
  quantity: number;
  size?: "icon-xs" | "icon" | "icon-sm" | "icon-lg";
  textSize?: string;
  max?: number;
};

/**
 * Quantity setter with debounced server sync.
 * Updates UI instantly and syncs to server after user stops clicking.
 */
export function QuantitySetter({
  id,
  quantity,
  size = "icon-xs",
  textSize = "text-sm",
  max = 100,
}: Props) {
  const [localQty, setLocalQty] = useState(quantity);
  const [isPending, startTransition] = useTransition();

  const syncToServer = useDebouncedCallback((newQty: number) => {
    startTransition(async () => {
      await updateQuantity(id, newQty);
    });
  }, DEBOUNCE_DELAY);

  const handleChange = (newQty: number) => {
    setLocalQty(newQty);
    syncToServer(newQty);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        disabled={localQty <= 1 || isPending}
        onClick={() => handleChange(localQty - 1)}
        size={size}
        variant="outline"
      >
        <MinusIcon className="size-3" />
      </Button>
      <span className={cn("w-6 text-center tabular-nums", textSize)}>
        {localQty}
      </span>
      <Button
        disabled={localQty >= max || isPending}
        onClick={() => handleChange(localQty + 1)}
        size={size}
        variant="outline"
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
}
