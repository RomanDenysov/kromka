import { getCart } from "@/lib/queries/cart";
import { Badge } from "../ui/badge";

export async function CartIndicator() {
  const cart = await getCart();
  const itemsCount =
    cart?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  return itemsCount > 0 ? (
    <Badge
      className="-top-1.5 -right-1.5 absolute aspect-square h-4 w-auto px-0.5 py-0 font-semibold text-[10px]"
      variant="default"
    >
      {itemsCount}
    </Badge>
  ) : null;
}

export const CartIndicatorLoader = (
  <span className="-top-1.5 -right-1.5 absolute size-4 animate-pulse rounded-full bg-muted" />
);
