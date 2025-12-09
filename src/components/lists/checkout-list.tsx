import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { AlertTriangleIcon } from "lucide-react";
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
  const _hasPickupRestriction = pickupDates && pickupDates.length > 0;

  return (
    <div className="grid grid-cols-[minmax(100px,15%)_1fr_auto] gap-3 rounded-md border p-3 shadow">
      <ProductImage
        alt={`${product.name} foto produktu`}
        className="aspect-square rounded-sm object-cover"
        height={120}
        src={product.images[0] || ""}
        width={120}
      />

      <div className="flex min-w-0 flex-col justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Link
            className="truncate font-medium text-sm hover:underline sm:text-base"
            href={`/product/${product.slug}`}
          >
            {product.name}
          </Link>
          <span className="text-muted-foreground text-xs sm:text-sm">
            {formatPrice(product.priceCents)}
          </span>

          <div className="flex flex-row items-center gap-0.5 sm:gap-1">
            <Badge
              className="mr-1 hidden sm:inline-flex"
              size="xs"
              variant="outline"
            >
              {product.category?.name}
            </Badge>

            <Hint text="Dostupné len v týchto dňoch">
              <div className="flex flex-row items-center gap-1">
                <AlertTriangleIcon className="size-4" />
                {pickupDates.map((date) => (
                  <span
                    className="whitespace-nowrap font-medium text-xs"
                    key={date}
                  >
                    {format(new Date(date), "d. MMM", { locale: sk })}
                  </span>
                ))}
              </div>
            </Hint>
          </div>
        </div>
        <QuantitySetter
          id={product.id}
          quantity={quantity}
          size="icon-sm"
          textSize="text-sm sm:text-base w-6 sm:w-8"
        />
      </div>
      <div className="flex flex-col items-end justify-between gap-2">
        <RemoveItemButton id={product.id} />
        <span className="font-medium text-base sm:text-lg">
          {formatPrice(product.priceCents * quantity)}
        </span>
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
