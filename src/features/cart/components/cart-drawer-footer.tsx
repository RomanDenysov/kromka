import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getCartTotals, getDetailedCart } from "@/features/cart/api/queries";
import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { getUserDetails } from "@/lib/auth/session";
import { cn, formatPrice } from "@/lib/utils";
import { LastOrderCard } from "./last-order-card";

async function LastOrderCardContent() {
  const lastOrder = await getLastOrderWithItemsAction();
  if (!lastOrder) {
    return null;
  }

  return (
    <div className="px-2">
      <LastOrderCard items={lastOrder.items} />
    </div>
  );
}

function LastOrderCardSkeleton() {
  return (
    <div className="px-2">
      <div className="space-y-2 rounded-lg border border-dashed bg-muted/40 p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
        <div className="space-y-2 py-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              className="h-12 w-full"
              key={`last-order-skeleton-${i.toString()}`}
            />
          ))}
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

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
