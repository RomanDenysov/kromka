"use client";

import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useCartActions } from "@/hooks/use-cart-actions";
import { cn, formatPrice } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/routers";
import { ProductImage } from "../shared/product-image";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type Props = {
  product: RouterOutputs["public"]["products"]["list"][number];
  className?: string;
};

export function FeaturedProductCard({ product, className }: Props) {
  const { addToCart, isAddingToCart } = useCartActions();
  const isActive = product.status === "active";

  return (
    <Link
      className={cn(
        "group relative block aspect-square overflow-hidden rounded-sm bg-muted shadow-sm",
        className
      )}
      href={`/e-shop/${product.slug}`}
      title={product.name}
    >
      <ProductImage
        alt={product.name}
        className={cn(
          "size-full object-cover transition-transform duration-500 group-hover:scale-105",
          !isActive && "opacity-60 grayscale"
        )}
        height={600}
        src={product.images[0] || ""}
        width={600}
      />

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 overflow-hidden">
            <h3 className="mb-1 truncate font-semibold text-base leading-tight">
              {product.name}
            </h3>
            <p className="font-semibold text-lg">
              {formatPrice(product.priceCents)}
            </p>
          </div>

          <Button
            className="h-10 w-10 shrink-0 rounded-full bg-white text-black shadow-md transition-all hover:scale-105 hover:bg-white/90"
            disabled={isAddingToCart || !isActive}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                productId: product.id,
                quantity: 1,
                product: {
                  id: product.id,
                  name: product.name,
                  priceCents: product.priceCents,
                  slug: product.slug,
                  imageUrl: product.images[0],
                },
              });
            }}
            size="icon"
          >
            {isAddingToCart ? (
              <Spinner className="size-5" />
            ) : (
              <ShoppingCartIcon className="size-5" />
            )}
            <span className="sr-only">Do košíka</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
