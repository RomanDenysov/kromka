import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getCartTotals, getDetailedCart } from "@/features/cart/queries";
import { getLastOrderWithItemsAction } from "@/features/checkout/actions";
import { getUser } from "@/lib/auth/session";
import { cn, formatPrice } from "@/lib/utils";
import { LastOrderCard } from "./last-order-card";

async function LastOrderCardContent() {
  const user = await getUser();
  const lastOrder = await getLastOrderWithItemsAction(user?.id);
  if (!lastOrder) {
    return null;
  }

  return (
    <>
      <Separator className="mb-4" />
      <div className="px-4">
        <LastOrderCard items={lastOrder.items} />
      </div>
    </>
  );
}

function LastOrderCardLoader() {
  return (
    <>
      <Separator className="mb-4" />
      <div className="space-y-3 px-4">
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
    </>
  );
}

export async function CartDrawerFooter() {
  const items = await getDetailedCart();
  const { totalCents } = getCartTotals(items);
  const isEmpty = items.length === 0;

  return (
    <>
      <Suspense fallback={<LastOrderCardLoader />}>
        <LastOrderCardContent />
      </Suspense>
      <Separator />
      <DrawerFooter>
        <div className="mb-2 flex items-center justify-between font-medium sm:mb-4">
          <span>Spolu</span>
          <span>{formatPrice(totalCents)}</span>
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
