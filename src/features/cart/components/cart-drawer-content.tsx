import { ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LastOrderCardContent,
  LastOrderCardSkeleton,
} from "@/features/buy-again-banner/components/last-order-card-content";
import {
  getCartTotals,
  getDetailedB2bCart,
  getDetailedCart,
} from "@/features/cart/api/queries";
import { getUserDetails } from "@/lib/auth/session";
import { cn, formatPrice } from "@/lib/utils";
import { B2bCartDrawerItem } from "./b2b-cart-drawer-item";
import { CartDrawerItem } from "./cart-drawer-item";
import { CartDrawerTabs } from "./cart-drawer-tabs";

function EmptyCart({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-2">
      <ShoppingCartIcon className="size-12 text-muted-foreground" />
      <span className="font-medium text-lg text-muted-foreground">
        {message}
      </span>
    </div>
  );
}

function CartItemsList({
  items,
  variant = "b2c",
}: {
  items: Awaited<ReturnType<typeof getDetailedCart>>;
  variant?: "b2c" | "b2b";
}) {
  if (items.length === 0) {
    return <EmptyCart message="Košík je prázdny" />;
  }

  return (
    <ScrollArea className="w-full flex-1 px-4 py-4">
      <div className="flex size-full flex-col gap-4">
        {items.map((item) =>
          variant === "b2b" ? (
            <B2bCartDrawerItem item={item} key={item.productId} />
          ) : (
            <CartDrawerItem item={item} key={item.productId} />
          )
        )}
      </div>
    </ScrollArea>
  );
}

function CartFooter({
  totalCents,
  isEmpty,
  checkoutHref,
  label,
}: {
  totalCents: number;
  isEmpty: boolean;
  checkoutHref: Route;
  label: string;
}) {
  return (
    <>
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
            href={checkoutHref}
          >
            {label}
          </Link>
        </DrawerClose>
      </DrawerFooter>
    </>
  );
}

/**
 * Unified cart drawer body that handles both B2B tabbed view and B2C simple view.
 * For B2B members: renders tabs with E-shop and B2B tabs, each with their own footer.
 * For B2C users: renders single cart with footer.
 */
export async function CartDrawerContent() {
  const [user, b2cItems] = await Promise.all([
    getUserDetails(),
    getDetailedCart(null),
  ]);

  const isB2bMember =
    user?.members && user.members.length > 0
      ? Boolean(user.members[0]?.organization)
      : false;

  const priceTierId = isB2bMember
    ? (user?.members?.[0]?.organization?.priceTierId ?? null)
    : null;

  const b2cTotals = getCartTotals(b2cItems);

  // B2B member: show tabbed cart with both B2C and B2B
  if (isB2bMember) {
    const b2bItems = await getDetailedB2bCart(priceTierId);
    const b2bTotals = getCartTotals(b2bItems);

    return (
      <CartDrawerTabs
        b2bContent={<CartItemsList items={b2bItems} variant="b2b" />}
        b2bFooter={
          <CartFooter
            checkoutHref={"/b2b/pokladna" as Route}
            isEmpty={b2bItems.length === 0}
            label="B2B pokladňa"
            totalCents={b2bTotals.totalCents}
          />
        }
        b2cContent={
          <>
            <CartItemsList items={b2cItems} />
            <Suspense fallback={<LastOrderCardSkeleton />}>
              <LastOrderCardContent />
            </Suspense>
          </>
        }
        b2cFooter={
          <CartFooter
            checkoutHref="/pokladna"
            isEmpty={b2cItems.length === 0}
            label="Prejsť na pokladňu"
            totalCents={b2cTotals.totalCents}
          />
        }
      />
    );
  }

  // Non-B2B: simple cart without tabs
  if (b2cItems.length === 0) {
    return <EmptyCart message="Váš košík je prázdny" />;
  }

  return (
    <div className="size-full flex-1 overflow-y-auto">
      <CartItemsList items={b2cItems} />
    </div>
  );
}
