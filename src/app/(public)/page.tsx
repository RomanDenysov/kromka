import type { Metadata } from "next";
import { CallToAction } from "@/components/landing/cta";
import { HomeGrid } from "@/components/landing/home-grid";
import { preloadFavorites } from "@/features/favorites/queries";
import { preloadProducts } from "@/features/products/queries";
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
  preloadProducts();
  preloadFavorites();
  return (
    <>
      <HomeGrid />
      <CallToAction />
    </>
  );
}
