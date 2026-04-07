import type { Metadata } from "next";
import { Suspense } from "react";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { CallToAction } from "@/components/landing/cta";
import { Container } from "@/components/shared/container";
import { featureFlags } from "@/config/features";
import { getActiveHeroBanner } from "@/features/hero-banners/api/queries";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";
import { Header } from "./_components/header";
import { HeaderActions } from "./_components/header-actions";
import { HomeHero } from "./_components/home-hero";
import {
  HomepageProducts,
  HomepageProductsSkeleton,
} from "./_components/homepage-products";
import { HomepageStoresSection } from "./_components/homepage-stores-section";
import { HomepageStoresSkeleton } from "./_components/homepage-stores-skeleton";

export const metadata: Metadata = createMetadata({
  title: "Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach",
  description:
    "Čerstvý kváskový chlieb, pečivo a koláče pečené s láskou. Objednajte online a vyzdvihnite si v našich predajniach v Prešove a Košiciach.",
  canonicalUrl: getSiteUrl(),
  image: "/images/shop.jpg",
});

export default async function Home() {
  const heroContent = await getActiveHeroBanner();

  return (
    <>
      <div className="sticky top-0 z-40">
        <Header>
          <HeaderActions />
        </Header>
      </div>
      <HomeHero content={heroContent} />
      <main className="w-full pt-5 pb-6 md:pb-10">
        <Container className="mt-6 space-y-6">
          <Suspense fallback={<HomepageProductsSkeleton />}>
            <HomepageProducts />
          </Suspense>
          <Suspense fallback={<HomepageStoresSkeleton />}>
            <HomepageStoresSection />
          </Suspense>
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
