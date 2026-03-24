import type { Metadata } from "next";
import { GameCardWrapper } from "@/components/game/game-card-wrapper";
import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { Container } from "@/components/shared/container";
import { featureFlags } from "@/config/features";
import { BuyAgainBanner } from "@/features/buy-again-banner/components/buy-again-banner";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach",
  description:
    "Čerstvý kváskový chlieb, pečivo a koláče pečené s láskou. Objednajte online a vyzdvihnite si v našich predajniach v Prešove a Košiciach.",
  canonicalUrl: getSiteUrl(),
  image: "/images/shop.jpg",
});

export default function Home() {
  return (
    <div className="w-full pt-5 pb-6 md:pb-10">
      <Container className="space-y-6">
        <BuyAgainBanner />
        <HomeGrid />
        {featureFlags.game && (
          <section className="container mx-auto flex justify-center px-4 py-8">
            <GameCardWrapper />
          </section>
        )}
        <CallToAction />
      </Container>
    </div>
  );
}
