import Link from "next/link";
import type { Product } from "@/lib/queries/products";
import { cn, formatPrice } from "@/lib/utils";
import { AddToCartButtonIcon } from "../shared/add-to-cart-button";
import { ProductImage } from "../shared/product-image";

type Props = {
  product: Product;
  className?: string;
};

export function FeaturedProductCard({ product, className }: Props) {
  const isActive = product?.status === "active";

  return (
    <Link
      className={cn(
        "group relative block aspect-square overflow-hidden rounded-sm bg-muted shadow-sm",
        className
      )}
      href={`/product/${product?.slug}`}
      title={product?.name}
    >
      <ProductImage
        alt={product?.name}
        className={cn(
          "size-full object-cover transition-transform duration-500 group-hover:scale-105",
          !isActive && "opacity-60 grayscale"
        )}
        height={600}
        src={product?.images[0] || ""}
        width={600}
      />

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 overflow-hidden">
            <h3 className="mb-1 truncate font-semibold text-base leading-tight">
              {product?.name}
            </h3>
            <p className="font-semibold text-lg">
              {formatPrice(product.priceCents)}
            </p>
          </div>

          <AddToCartButtonIcon disabled={!isActive} id={product.id} />
        </div>
      </div>
    </Link>
  );
}
