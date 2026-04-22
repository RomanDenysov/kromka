import type { Metadata } from "next";
import { Suspense } from "react";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { B2BCta } from "@/components/landing/b2b-cta";
import { LoyaltyBanner } from "@/components/landing/loyalty-banner";
import { Container } from "@/components/shared/container";
import { PageSection } from "@/components/shared/public-page";
import { featureFlags } from "@/config/features";
import { ReorderBar } from "@/features/buy-again-banner/components/reorder-bar";
import { getLastOrderWithItemsAction } from "@/features/checkout/api/actions";
import { HomeBlogSection } from "@/features/posts/components/home-blog-section";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";
import { BrandStorySection } from "./_components/brand-story-section";
import { HomeHero } from "./_components/home-hero";
import { HomepageBlogSkeleton } from "./_components/homepage-blog-skeleton";
import { HomepagePecivoProducts } from "./_components/homepage-pecivo-products";
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
  const lastOrderPromise = getLastOrderWithItemsAction();
  return (
    <>
      <HomeHero />
      <Container className="my-12 space-y-8 md:my-16 md:space-y-12 xl:my-20 xl:space-y-16">
        <div className="space-y-4">
          <Suspense fallback={null}>
            <RegistrationBanner />
          </Suspense>
          <Suspense>
            <ReorderBar lastOrderPromise={lastOrderPromise} />
          </Suspense>
        </div>
        <Suspense fallback={<HomepageProductsSkeleton />}>
          <HomepageProducts />
        </Suspense>
        {featureFlags.brandStorySection && <BrandStorySection />}
        <Suspense fallback={<HomepageStoresSkeleton />}>
          <HomepageStoresSection />
        </Suspense>
        <Suspense fallback={<HomepageProductsSkeleton />}>
          <HomepagePecivoProducts />
        </Suspense>
        <LoyaltyBanner />
        {featureFlags.game && (
          <PageSection spacing="md">
            <div className="flex justify-center">
              <GameCardWrapper />
            </div>
          </PageSection>
        )}
      </Container>
      <Suspense fallback={<HomepageBlogSkeleton />}>
        <HomeBlogSection />
      </Suspense>
      {featureFlags.b2b && <B2BCta />}
    </>
  );
}
