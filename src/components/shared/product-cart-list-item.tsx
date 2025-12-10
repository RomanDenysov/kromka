import Image from "next/image";
import Link from "next/link";
import type { DetailedCartItem } from "@/lib/cart/queries";
import { formatPrice } from "@/lib/utils";
import { RemoveItemButton } from "../checkout/remove-item-button";
import { Badge } from "../ui/badge";
import { QuantitySetter } from "./quantity-setter";

type Props = {
  product: DetailedCartItem;
  quantity: number;
};

export function ProductCartListItem({ product, quantity }: Props) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex gap-2">
        <Image
          alt={product.name}
          className="aspect-square rounded-sm bg-muted object-cover object-center"
          height={60}
          quality={75}
          src={product.imageUrl || "/images/sec.webp"}
          width={60}
        />

        <div className="flex grow flex-col items-start justify-between gap-1">
          <Link
            className="font-medium text-sm hover:underline"
            href={`/product/${product.slug}`}
          >
            {product.name}
          </Link>
          {product.category && (
            <Badge size="xs" variant="secondary">
              {product.category.name}
            </Badge>
          )}
          <span className="text-muted-foreground text-xs">
            {formatPrice(product.priceCents)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm">
            {formatPrice(product.priceCents * quantity)}
          </span>
          <RemoveItemButton
            iconClassName="size-3 sm:size-4"
            id={product.productId}
            size="icon-xs"
            variant="ghost"
          />
        </div>
        <QuantitySetter id={product.productId} quantity={quantity} />
      </div>
    </div>
  );
}
