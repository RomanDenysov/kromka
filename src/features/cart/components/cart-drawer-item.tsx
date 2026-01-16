import Link from "next/link";
import { ProductImage } from "@/components/shared/product-image";
import { QuantitySetter } from "@/components/shared/quantity-setter";
import type { DetailedCartItem } from "@/features/cart/queries";
import { RemoveItemButton } from "@/features/checkout/components/remove-item-button";
import { formatPrice } from "@/lib/utils";

type Props = {
  item: DetailedCartItem;
};

export function CartDrawerItem({ item }: Props) {
  return (
    <div className="flex gap-3">
      <ProductImage
        alt={item.name}
        className="aspect-square size-20 rounded-sm object-cover"
        height={80}
        src={item.imageUrl ?? "/images/cooperation.jpg"}
        width={80}
      />

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            className="line-clamp-2 font-medium text-sm hover:underline"
            href={`/product/${item.slug}`}
          >
            {item.name}
          </Link>
          <span className="text-muted-foreground text-sm">
            {formatPrice(item.priceCents)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <QuantitySetter id={item.productId} quantity={item.quantity} />
          <RemoveItemButton id={item.productId} />
        </div>
      </div>
    </div>
  );
}
