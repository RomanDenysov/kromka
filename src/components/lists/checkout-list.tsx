import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { getCart } from "@/lib/queries/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";
import { RemoveItemButton } from "../checkout/remove-item-button";
import { Hint } from "../shared/hint";
import { ProductImage } from "../shared/product-image";
import { QuantitySetter } from "../shared/quantity-setter";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export async function CheckoutList() {
  const cart = await getCart();
  const items = cart?.items ?? [];

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

  const pickupDates = product.category?.pickupDates ?? [];
  const hasPickupRestriction = pickupDates && pickupDates.length > 0;

  return (
    <div className="flex flex-row gap-2 rounded-md border p-3 shadow sm:gap-5">
      <ProductImage
        alt={product.name}
        className="aspect-square rounded-sm object-cover"
        height={100}
        src={product.images[0] || ""}
        width={100}
      />

      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex flex-1 grow flex-col items-start gap-2">
            <Link
              className="flex flex-row items-center gap-1 font-medium text-base hover:underline"
              href={`/product/${product.slug}`}
            >
              {product.name}
            </Link>
            <span className="text-muted-foreground text-sm">
              {formatPrice(product.priceCents)}
            </span>
            {hasPickupRestriction && (
              <div className="flex flex-row flex-wrap items-center gap-1">
                <Hint text="Dostupné len v týchto dňoch">
                  <CalendarIcon className="size-3" />
                </Hint>
                {pickupDates.map((date) => (
                  <Badge key={date} size="xs" variant="secondary">
                    {format(new Date(date), "dd. MMM", { locale: sk })}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <RemoveItemButton id={product.id} />
        </div>
        <div className="flex flex-row items-center justify-between gap-2">
          <QuantitySetter
            id={product.id}
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

export function CheckoutListSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="flex size-full min-h-24 flex-row gap-2 rounded-md border p-3"
            key={`skeleton-${index.toString()}`}
          >
            <Skeleton className="size-[100px] rounded-sm" />
            <div className="flex flex-1 flex-col justify-between gap-2">
              <div className="flex flex-row items-center justify-between gap-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="size-7 rounded" />
              </div>
              <div className="flex flex-row items-center justify-between gap-2">
                <Skeleton className="h-7 w-1/4" />
                <Skeleton className="h-7 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
