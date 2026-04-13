import { HeartIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  FavoritesBadge,
  FavoritesBadgeSkeleton,
} from "@/components/favorites/favorites-badge";
import { buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

export function HeaderActions() {
  const user = getUser();

  return (
    <div className="flex items-center justify-end gap-2 xl:gap-3">
      <Suspense fallback={<Skeleton className="size-8 rounded-md" />}>
        <UserButton promise={user} />
      </Suspense>

      <Link
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "relative hidden md:inline-flex"
        )}
        href="/profil/oblubene"
      >
        <HeartIcon className="size-5" />
        <Suspense fallback={FavoritesBadgeSkeleton}>
          <FavoritesBadge />
        </Suspense>
        <span className="sr-only">Obľúbené</span>
      </Link>

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
