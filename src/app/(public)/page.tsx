import type { Metadata } from "next";
import { getHomepageLayout } from "@/features/homepage/api/queries";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";
import { HomepageLayoutRenderer } from "./_components/homepage-layout-renderer";

export const metadata: Metadata = createMetadata({
  title: "Pekáreň Kromka - Remeselná pekáreň v Prešove a Košiciach",
  description:
    "Kváskový chlieb, čerstvé pečivo a koláče v Prešove a Košiciach. Remeselná pekáreň Kromka - objednajte online, vyzdvihnite v predajni.",
  canonicalUrl: getSiteUrl(),
  image: "/images/shop.jpg",
});

export default async function Home() {
  const sections = await getHomepageLayout();

  return <HomepageLayoutRenderer sections={sections} />;
}
