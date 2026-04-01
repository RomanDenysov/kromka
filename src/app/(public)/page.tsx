import type { Metadata } from "next";
import { Suspense } from "react";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { Container } from "@/components/shared/container";
import { featureFlags } from "@/config/features";
import { ReorderBarContent } from "@/features/buy-again-banner/components/reorder-bar-content";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";
import { HeaderActions } from "./_components/header-actions";
import { HomeHero } from "./_components/home-hero";
import {
  HomepageProducts,
  HomepageProductsSkeleton,
} from "./_components/homepage-products";

export const metadata: Metadata = createMetadata({
  title: "Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach",
  description:
    "Čerstvý kváskový chlieb, pečivo a koláče pečené s láskou. Objednajte online a vyzdvihnite si v našich predajniach v Prešove a Košiciach.",
  canonicalUrl: getSiteUrl(),
  image: "/images/shop.jpg",
});

export default function Home() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60]">
        <Suspense>
          <ReorderBarContent />
        </Suspense>
      </div>
      <HomeHero actions={<HeaderActions />} />
      <main className="w-full pt-5 pb-6 md:pb-10">
        <Container className="mt-6 space-y-6">
          <Suspense fallback={<HomepageProductsSkeleton />}>
            <HomepageProducts />
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
