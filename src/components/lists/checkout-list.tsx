"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useGetCart } from "@/hooks/use-get-cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem, CartItems } from "@/types/cart";
import { ProductImage } from "../shared/product-image";
import { QuantitySetter } from "../shared/quantity-setter";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function CheckoutList() {
  const { data: cart, isLoading } = useGetCart();
  const items = useMemo<CartItems>(() => cart?.items ?? [], [cart]);

  if (isLoading) {
    return <CheckoutListSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {items?.map((item) => (
          <CheckoutListItem item={item} key={item.product.id} />
        ))}
      </div>
    </div>
  );
}

function CheckoutListItem({ item }: { item: CartItem }) {
  const { product, quantity } = item;
  const { removeFromCart, isRemovingFromCart } = useCartActions();
  return (
    <div className="flex flex-row gap-2 rounded-md border p-3 shadow sm:gap-5">
      <ProductImage
        alt={product.name}
        className="aspect-square rounded-sm object-cover"
        height={100}
        src={product.images[0]?.url || ""}
        width={100}
      />

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex flex-1 grow flex-col items-start gap-2">
            <Link
              className="flex flex-row items-center gap-1 font-medium text-base hover:underline"
              href={`/e-shop/${product.slug}`}
            >
              {product.name}
              {/* <SquareArrowOutUpRight className="size-4" /> */}
            </Link>
            <span className="text-muted-foreground text-sm">
              {formatPrice(product.priceCents)}
            </span>
          </div>

          <Button
            aria-label="Odstrániť z košíka"
            disabled={isRemovingFromCart}
            onClick={() => removeFromCart({ productId: product.id })}
            size={"icon-sm"}
            type="button"
            variant="ghost"
          >
            <XIcon className="size-5 sm:size-6" />
            <span className="sr-only">Odstrániť z košíka</span>
          </Button>
        </div>
        <div className="flex flex-row items-center justify-between gap-2">
          <QuantitySetter
            productId={product.id}
            quantity={quantity}
            size="icon"
            textSize="text-sm sm:text-base w-6 sm:w-8"
          />
          <span className="font-medium text-base sm:text-lg">
            {formatPrice(product.priceCents * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckoutListSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="flex size-full flex-col gap-2 rounded-md border p-3"
            key={`skeleton-${index.toString()}`}
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
