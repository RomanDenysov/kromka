import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  LastOrderCardContent,
  LastOrderCardSkeleton,
} from "@/features/buy-again-banner/components/last-order-card-content";
import { getCartTotals, getDetailedCart } from "@/features/cart/api/queries";
import { getUserDetails } from "@/lib/auth/session";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Cart drawer footer for non-B2B users.
 * B2B users get their footer embedded in the tabbed CartDrawerContent.
 * This component returns null for B2B members.
 */
export async function CartDrawerFooter() {
  const [user, items] = await Promise.all([
    getUserDetails(),
    getDetailedCart(null),
  ]);

  // B2B members get their footer inside CartDrawerContent (tabbed view)
  const isB2bMember =
    user?.members && user.members.length > 0
      ? Boolean(user.members[0]?.organization)
      : false;

  if (isB2bMember) {
    return null;
  }

  const { totalCents } = getCartTotals(items);
  const isEmpty = items.length === 0;

  return (
    <>
      <Suspense fallback={<LastOrderCardSkeleton />}>
        <LastOrderCardContent />
      </Suspense>
      <Separator className="mt-2" />
      <DrawerFooter>
        <div className="flex items-center justify-between text-lg md:text-xl">
          <span className="font-semibold">Spolu</span>
          <span className="font-bold">{formatPrice(totalCents)}</span>
        </div>
        <DrawerClose asChild disabled={isEmpty}>
          <Link
            className={cn(
              buttonVariants({ size: "lg", className: "w-full" }),
              "text-base",
              isEmpty && "pointer-events-none opacity-50"
            )}
            href="/pokladna"
          >
            Prejsť na pokladňu
          </Link>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

export function CartDrawerFooterLoader() {
  return (
    <DrawerFooter>
      <div className="mb-2 flex items-center justify-between font-medium sm:mb-4">
        <span>Spolu</span>
        <Spinner />
      </div>
      <Skeleton className="h-10 w-full" />
    </DrawerFooter>
  );
}
