"use client";

import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import { addToCart } from "@/features/cart/api/actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { analytics } from "@/lib/analytics";

type Props = {
  id: string;
  disabled: boolean;
  max?: number;
  product?: { name: string; price: number; category: string; categoryId: string };
};

export function AddWithQuantityButton({
  id,
  disabled,
  max = 100,
  product,
}: Props) {
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Track product view on mount (replaces ProductViewTracker component)
  const hasTracked = useRef(false);
  useEffect(() => {
    if (product && !hasTracked.current) {
      hasTracked.current = true;
      analytics.productViewed({
        product_id: id,
        product_name: product.name,
        price: product.price,
        category: product.category,
        category_id: product.categoryId,
      });
    }
  }, [id, product]);

  const handleAddToCart = () => {
    const qty = quantity;
    startTransition(async () => {
      await addToCart(id, qty);
      if (product) {
        analytics.productAdded({
          product_id: id,
          product_name: product.name,
          price: product.price,
          quantity: qty,
          cart_type: "b2c",
          source: "product_page",
        });
      }
      setQuantity(1);
    });
  };

  return (
    <div className="flex w-full flex-col items-start justify-between gap-6 md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <span className="font-medium">Množstvo:</span>
        <ButtonGroup aria-label="Product quantity setter">
          <Button
            aria-label="Decrease quantity"
            disabled={disabled || isPending || quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            size={isMobile ? "icon" : "icon-lg"}
            variant="secondary"
          >
            <MinusIcon />
          </Button>
          <ButtonGroupSeparator />
          <ButtonGroupText className="min-w-10 items-center justify-center text-center text-sm tabular-nums md:min-w-14 md:text-base">
            {quantity}
          </ButtonGroupText>
          <ButtonGroupSeparator />
          <Button
            aria-label="Increase quantity"
            disabled={disabled || isPending || quantity >= max}
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            size={isMobile ? "icon" : "icon-lg"}
            variant="secondary"
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>
      </div>
      <Button
        className="w-full flex-1 md:w-auto md:text-base"
        disabled={disabled || isPending}
        onClick={handleAddToCart}
        size={isMobile ? "default" : "lg"}
      >
        {isPending ? <Spinner /> : <ShoppingCartIcon />}
        <span>Do košíka</span>
      </Button>
    </div>
  );
}
