import { HeartIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import {
  FavoritesBadge,
  FavoritesBadgeSkeleton,
} from "@/components/favorites/favorites-badge";
import { Footer } from "@/components/landing/footer";
import { LoginModal } from "@/components/login-modal";
import { JsonLd } from "@/components/seo/json-ld";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
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
import { preloadFavorites } from "@/features/favorites/queries";
import { preloadProducts } from "@/features/products/queries";
import { getUser } from "@/lib/auth/session";
import { defaultMetadata } from "@/lib/metadata";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: {
    default: "Pekáreň Kromka – Remeselná pekáreň",
    template: "%s | Pekáreň Kromka",
  },
  description:
    "Pripravte sa na Vianoce s Pekárňou Kromka. Voňavá kváskova vianočka, makový a orechový závin a čerstvý chlieb na sviatočný stôl. Remeselná kvalita s láskou.",
  ...defaultMetadata,
};

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  preloadProducts();
  preloadFavorites();

  const user = getUser();

  return (
    <>
      <JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
      <Header>
        <div className="flex items-center justify-end gap-2 xl:gap-3">
          <Suspense fallback={<Skeleton className="size-8 rounded-md" />}>
            <UserButton promise={user} />
          </Suspense>

          <Link
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "relative"
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
      </Header>
      <main className="min-h-svh">{children}</main>
      <Footer />

      <LoginModal />
      <ScrollToTop />
    </>
  );
}
