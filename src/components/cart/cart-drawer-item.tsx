import Link from "next/link";
import type { DetailedCartItem } from "@/lib/cart/queries";
import { formatPrice } from "@/lib/utils";
import { RemoveItemButton } from "../checkout/remove-item-button";
import { ProductImage } from "../shared/product-image";
import { QuantitySetter } from "../shared/quantity-setter";

type Props = {
  item: DetailedCartItem;
};

export function CartDrawerItem({ item }: Props) {
  return (
    <div className="flex gap-3">
      <ProductImage
        alt={item.name}
        className="size-20 rounded-md object-cover"
        height={80}
        src={item.imageUrl}
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
