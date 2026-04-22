import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/components/user-button";
import {
  CartBadge,
  CartBadgeSkeleton,
} from "@/features/cart/components/cart-badge";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { CartDrawerContent } from "@/features/cart/components/cart-drawer-content";
import {
  CartDrawerFooter,
  CartDrawerFooterLoader,
} from "@/features/cart/components/cart-drawer-footer";
import { getUser } from "@/lib/auth/session";

export function HeaderActions() {
  const user = getUser();

  return (
    <div className="flex items-center justify-end gap-2 xl:gap-3">
      <Suspense fallback={<Skeleton className="size-8 rounded-md" />}>
        <UserButton promise={user} />
      </Suspense>

      <Suspense>
        <CartDrawer
          indicator={
            <Suspense fallback={CartBadgeSkeleton}>
              <CartBadge />
            </Suspense>
          }
        >
          <Suspense>
            <CartDrawerContent />
          </Suspense>
          <Suspense fallback={<CartDrawerFooterLoader />}>
            <CartDrawerFooter />
          </Suspense>
        </CartDrawer>
      </Suspense>
    </div>
  );
}
