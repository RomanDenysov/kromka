import { format } from "date-fns";
import { sk } from "date-fns/locale/sk";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import type { DetailedCartItem } from "@/lib/cart/queries";
import { formatPrice } from "@/lib/utils";
import { RemoveItemButton } from "../checkout/remove-item-button";
import { Hint } from "../shared/hint";
import { ProductImage } from "../shared/product-image";
import { QuantitySetter } from "../shared/quantity-setter";
import { Badge } from "../ui/badge";

export function CheckoutListItem({ item }: { item: DetailedCartItem }) {
  const pickupDates = item.category?.pickupDates ?? [];
  const hasPickupRestriction = pickupDates.length > 0;

  return (
    <div className="grid grid-cols-[minmax(100px,15%)_1fr_auto] gap-3 rounded-md border p-3 shadow">
      <ProductImage
        alt={`${item.name} foto produktu`}
        className="aspect-square rounded-sm object-cover"
        height={120}
        src={item.imageUrl ?? "/images/cooperation.jpg"}
        width={120}
      />

      <div className="flex min-w-0 flex-col justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Link
            className="truncate font-medium text-sm hover:underline sm:text-base"
            href={`/product/${item.slug}`}
          >
            {item.name}
          </Link>
          <span className="text-muted-foreground text-xs sm:text-sm">
            {formatPrice(item.priceCents)}
          </span>

          <div className="flex flex-row items-center gap-0.5 sm:gap-1">
            {item.category?.name && (
              <Badge
                className="mr-1 hidden sm:inline-flex"
                size="xs"
                variant="outline"
              >
                {item.category.name}
              </Badge>
            )}

            {hasPickupRestriction && (
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
            )}
          </div>
        </div>

        <QuantitySetter
          id={item.productId}
          quantity={item.quantity}
          size="icon-sm"
          textSize="text-sm sm:text-base w-6 sm:w-8"
        />
      </div>

      <div className="flex flex-col items-end justify-between gap-2">
        <RemoveItemButton id={item.productId} />
        <span className="font-medium text-base sm:text-lg">
          {formatPrice(item.priceCents * item.quantity)}
        </span>
      </div>
    </div>
  );
}
