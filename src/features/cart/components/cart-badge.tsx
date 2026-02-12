import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getB2bCart, getCart } from "@/features/cart/cookies";
import { getUserDetails } from "@/lib/auth/session";

export async function CartBadge() {
  const [cart, user] = await Promise.all([getCart(), getUserDetails()]);
  let totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

  // Add B2B cart items for B2B members
  const isB2bMember =
    user?.members && user.members.length > 0
      ? Boolean(user.members[0]?.organization)
      : false;

  if (isB2bMember) {
    const b2bCart = await getB2bCart();
    totalQty += b2bCart.reduce((sum, i) => sum + i.qty, 0);
  }

  if (totalQty === 0) {
    return null;
  }

  return (
    <Badge
      className="absolute -top-1.5 -right-1.5 aspect-square h-4 w-auto px-0.5 py-0 font-semibold text-[10px]"
      variant="default"
    >
      {totalQty}
    </Badge>
  );
}

export const CartBadgeSkeleton = (
  <Skeleton className="absolute -top-1.5 -right-1.5 size-4 rounded-full" />
);
