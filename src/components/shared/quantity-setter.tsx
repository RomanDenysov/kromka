"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { updateCartItemQuantity } from "@/lib/actions/cart";
import { cn } from "@/lib/utils";

const DEBOUNCE_DELAY = 500;

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
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const lastServerQuantity = useRef(quantity);

  // Sync from server when prop changes (e.g., after revalidation)
  useEffect(() => {
    if (quantity !== lastServerQuantity.current) {
      lastServerQuantity.current = quantity;
      setLocalQuantity(quantity);
    }
  }, [quantity]);

  const syncToServer = useDebouncedCallback((newQuantity: number) => {
    if (newQuantity !== lastServerQuantity.current) {
      lastServerQuantity.current = newQuantity;
      updateCartItemQuantity(id, newQuantity);
    }
  }, DEBOUNCE_DELAY);

  const handleDecrement = useCallback(() => {
    setLocalQuantity((prev) => {
      const next = Math.max(1, prev - 1);
      syncToServer(next);
      return next;
    });
  }, [syncToServer]);

  const handleIncrement = useCallback(() => {
    setLocalQuantity((prev) => {
      const next = Math.min(max, prev + 1);
      syncToServer(next);
      return next;
    });
  }, [max, syncToServer]);

  return (
    <div className="flex items-center gap-1">
      <Button
        disabled={localQuantity <= 1}
        onClick={handleDecrement}
        size={size}
        variant="outline"
      >
        <MinusIcon className="size-3" />
      </Button>
      <span className={cn("w-6 text-center tabular-nums", textSize)}>
        {localQuantity}
      </span>
      <Button
        disabled={localQuantity >= max}
        onClick={handleIncrement}
        size={size}
        variant="outline"
      >
        <PlusIcon className="size-3" />
      </Button>
    </div>
  );
}
