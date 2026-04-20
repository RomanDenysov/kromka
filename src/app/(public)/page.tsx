import type { Metadata } from "next";
import { Suspense } from "react";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { B2BCta } from "@/components/landing/b2b-cta";
import { LoyaltyBanner } from "@/components/landing/loyalty-banner";
import { Container } from "@/components/shared/container";
import { featureFlags } from "@/config/features";
import { ReorderBar } from "@/features/buy-again-banner/components/reorder-bar";
import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { getActiveHeroBanner } from "@/features/hero-banners/api/queries";
import { HomeBlogSection } from "@/features/posts/components/home-blog-section";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";
import { BrandStorySection } from "./_components/brand-story-section";
import { HomeHero } from "./_components/home-hero";
import { HomepageBlogSkeleton } from "./_components/homepage-blog-skeleton";
import {
  HomepageProducts,
  HomepageProductsSkeleton,
} from "./_components/homepage-products";
import { HomepageStoresSection } from "./_components/homepage-stores-section";
import { HomepageStoresSkeleton } from "./_components/homepage-stores-skeleton";
import { RegistrationBanner } from "./_components/registration-banner";

export const metadata: Metadata = createMetadata({
  title: "Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach",
  description:
    "Čerstvý kváskový chlieb, pečivo a koláče pečené s láskou. Objednajte online a vyzdvihnite si v našich predajniach v Prešove a Košiciach.",
  canonicalUrl: getSiteUrl(),
  image: "/images/shop.jpg",
});

export default async function Home() {
  const heroContentPromise = getActiveHeroBanner();
  const lastOrderPromise = getLastOrderWithItemsAction();
  return (
    <>
      <HomeHero contentPromise={heroContentPromise} />
      <Container className="my-12 space-y-8 md:my-16 md:space-y-12 xl:my-20 xl:space-y-16">
        <Suspense>
          <ReorderBar lastOrderPromise={lastOrderPromise} />
        </Suspense>
        <Suspense fallback={null}>
          <RegistrationBanner />
        </Suspense>
        <Suspense fallback={<HomepageProductsSkeleton />}>
          <HomepageProducts />
        </Suspense>
        <BrandStorySection />
        <Suspense fallback={<HomepageStoresSkeleton />}>
          <HomepageStoresSection />
        </Suspense>
        <LoyaltyBanner />
        {featureFlags.game && (
          <section className="container mx-auto flex justify-center px-4 py-8">
            <GameCardWrapper />
          </section>
        )}
      </Container>
      <Suspense fallback={<HomepageBlogSkeleton />}>
        <HomeBlogSection />
      </Suspense>
      {featureFlags.b2b && <B2BCta />}
    </>
  );
}
