import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CartDrawerFooter,
  CartDrawerFooterLoader,
} from "@/components/cart-drawer-footer";
import { CartDrawer } from "@/components/drawers/cart-drawer";
import { Icons } from "@/components/icons";
import { MobileNavigation } from "@/components/mobile-nav";
import { StoreSelectModal } from "@/components/modal/store-select-modal";
import { CartDrawerContent } from "@/components/shared/cart-drawer-content";
import {
  CartIndicator,
  CartIndicatorLoader,
} from "@/components/shared/cart-indicator";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { getStores } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";

const navigation: { name: string; href: Route }[] = [
  { name: "E-shop", href: "/e-shop" },
  { name: "B2B", href: "/b2b" },
  { name: "Predajne", href: "/predajne" },
  // TODO: add blog back when it's ready
  // { name: "Blog", href: "/blog" },
] as const;

export function Header() {
  const stores = getStores();
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Container>
        <div className="flex h-14 w-full items-center justify-center gap-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-5">
          {/* Navigation */}
          <MobileNavigation navigation={navigation}>
            <StoreSelectModal storesPromise={stores} />
          </MobileNavigation>
          <nav className="hidden grow items-center justify-start gap-2 md:flex">
            {navigation.map((item) => (
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                href={item.href}
                key={item.href}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex grow items-center justify-start md:justify-center">
            <Link href="/">
              <Icons.kromka className="h-4 lg:h-5" />
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden md:block">
              <Suspense>
                <StoreSelectModal storesPromise={stores} />
              </Suspense>
            </div>
            <Suspense>
              <UserButton />
            </Suspense>
            <Suspense>
              <CartDrawer
                indicator={
                  <Suspense fallback={CartIndicatorLoader}>
                    <CartIndicator />
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
        </div>
      </Container>
    </header>
  );
}
