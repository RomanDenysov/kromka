import { HeartIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  FavoritesBadge,
  FavoritesBadgeSkeleton,
} from "@/components/favorites/favorites-badge";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/components/user-button";
import { featureFlags } from "@/config/features";
import { BuyAgainBanner } from "@/features/buy-again-banner/components/buy-again-banner";
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
import { createMetadata } from "@/lib/metadata";
import { cn, getSiteUrl } from "@/lib/utils";
import { HomeHero } from "./_components/home-hero";

export const metadata: Metadata = createMetadata({
  title: "Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach",
  description:
    "Čerstvý kváskový chlieb, pečivo a koláče pečené s láskou. Objednajte online a vyzdvihnite si v našich predajniach v Prešove a Košiciach.",
  canonicalUrl: getSiteUrl(),
  image: "/images/shop.jpg",
});

export default function Home() {
  const user = getUser();

  return (
    <>
      <HomeHero
        actions={
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
              <span className="sr-only">Oblubene</span>
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
        }
      />
      <main className="w-full pt-5 pb-6 md:pb-10">
        <Container className="space-y-6">
          <Suspense>
            <BuyAgainBanner />
          </Suspense>
          <HomeGrid />
          {featureFlags.game && (
            <section className="container mx-auto flex justify-center px-4 py-8">
              <GameCardWrapper />
            </section>
          )}
          <CallToAction />
        </Container>
      </main>
    </>
  );
}
