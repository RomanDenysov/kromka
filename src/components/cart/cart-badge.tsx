import { getCart } from "@/lib/cart/cookies";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export async function CartBadge() {
  const cart = await getCart();
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

  if (totalQty === 0) {
    return null;
  }

  return (
    <Badge
      className="-top-1.5 -right-1.5 absolute aspect-square h-4 w-auto px-0.5 py-0 font-semibold text-[10px]"
      variant="default"
    >
      {totalQty}
    </Badge>
  );
}

export const CartBadgeSkeleton = (
  <Skeleton className="-top-1.5 -right-1.5 absolute size-4 rounded-full" />
);
