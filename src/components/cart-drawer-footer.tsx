import Link from "next/link";
import { getCart } from "@/lib/queries/cart";
import { cn, formatPrice } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { DrawerClose, DrawerFooter } from "./ui/drawer";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

export async function CartDrawerFooter() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );
  return (
    items.length > 0 && (
      <>
        <Separator />
        <DrawerFooter>
          <div className="mb-2 flex items-center justify-between font-medium sm:mb-4">
            <span>Spolu</span>
            <span>{formatPrice(totalCents)}</span>
          </div>
          <DrawerClose asChild>
            <Link
              className={cn(
                buttonVariants({ size: "lg", className: "w-full" }),
                "text-base"
              )}
              href={"/pokladna"}
            >
              Prejsť na pokladňu
            </Link>
          </DrawerClose>
        </DrawerFooter>
      </>
    )
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
