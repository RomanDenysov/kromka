import Link from "next/link";
import { getCartTotals, getDetailedCart } from "@/lib/cart/queries";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { DrawerClose, DrawerFooter } from "../ui/drawer";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";

export async function CartDrawerFooter() {
  const items = await getDetailedCart();
  const { totalCents } = getCartTotals(items);
  const isEmpty = items.length === 0;

  return (
    <>
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
