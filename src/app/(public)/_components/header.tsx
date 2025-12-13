import { MenuIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartBadge, CartBadgeSkeleton } from "@/components/cart/cart-badge";
import { CartDrawerContent } from "@/components/cart/cart-drawer-content";
import {
  CartDrawerFooter,
  CartDrawerFooterLoader,
} from "@/components/cart/cart-drawer-footer";
import { CartDrawer } from "@/components/drawers/cart-drawer";
import { Icons } from "@/components/icons";
import { MobileNavigation } from "@/components/mobile-nav";
import { StoreSelectModal } from "@/components/modal/store-select-modal";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { getStores } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { FavoritesLink } from "./favorites-link";

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
        <div className="flex h-12 w-full items-center justify-center gap-4 md:grid md:h-14 md:grid-cols-[1fr_auto_1fr] md:gap-5">
          {/* Navigation */}
          <Suspense
            fallback={
              <Button
                className="md:hidden"
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <MenuIcon className="size-5" />
              </Button>
            }
          >
            <MobileNavigation navigation={navigation}>
              <StoreSelectModal storesPromise={stores} />
            </MobileNavigation>
          </Suspense>
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
          <div className="flex items-center justify-end gap-2 xl:gap-3">
            <div className="hidden md:block">
              <Suspense>
                <StoreSelectModal storesPromise={stores} />
              </Suspense>
            </div>
            <Suspense>
              <UserButton />
            </Suspense>
            <Suspense>
              <FavoritesLink />
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
        </div>
      </Container>
    </header>
  );
}
