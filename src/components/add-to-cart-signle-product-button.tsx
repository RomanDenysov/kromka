"use client";

import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Product } from "@/lib/queries/products";
import { useCart } from "./cart/cart-context";
import { Button } from "./ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./ui/button-group";
import { Spinner } from "./ui/spinner";

export function AddToCartSingleProductButton({
  disabled,
  product,
  maxQuantity = 100,
}: {
  disabled: boolean;
  product: Product;
  maxQuantity?: number;
}) {
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(() => {
      addToCart(product.id, quantity, product);
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
            disabled={disabled || isPending || quantity >= maxQuantity}
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
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

export function SingleProductSkeleton() {
  return (
    <div className="flex grow flex-col gap-8">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-3 sm:gap-x-12 md:grid-cols-5">
        <div className="col-span-1 md:col-span-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>
        <div className="col-span-1 flex flex-col gap-6 sm:col-span-2 md:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          <Separator />
          <Skeleton className="h-8 w-32" />
          <div className="h-[200px] w-full">
            <Skeleton className="size-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
