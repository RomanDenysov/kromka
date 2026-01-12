import type { Metadata } from "next";
import { Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { getStores } from "@/features/stores/queries";
import { createMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/utils";
import { StoresSection, StoresSectionSkeleton } from "./stores-section";

export const metadata: Metadata = createMetadata({
  title: "Naše predajne",
  description:
    "Navštívte nás v Košiciach alebo Prešove. Čerstvé pečivo každý deň od skorého rána. Nájdite najbližšiu predajňu Pekárne Kromka.",
  canonicalUrl: getSiteUrl("/predajne"),
});

export default async function StoresPage() {
  const stores = await getStores();
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Predajne" }]} />

      <div className="space-y-12 py-8">
        {/* Hero Section - Minimal */}
        <section className="space-y-4">
          <h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
            Naše predajne
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Navštívte nás v Košiciach alebo Prešove. Čerstvé pečivo každý deň od
            skorého rána.
          </p>
        </section>

        {/* Stores Grid + Map Section */}
        <Suspense fallback={<StoresSectionSkeleton />}>
          <StoresSection stores={stores} />
        </Suspense>
      </div>
    </PageWrapper>
  );
}
