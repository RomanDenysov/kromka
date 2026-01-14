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

export default function StoresPage() {
  const stores = getStores();
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Predajne" }]} />

      {/* Hero Section - Minimal */}
      <div className="space-y-4">
        <h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
          Naše predajne
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Navštívte nás v Košiciach alebo Prešove. Čerstvé pečivo každý deň od
          skorého rána.
        </p>
      </div>

      {/* Stores Grid + Map Section */}
      <Suspense fallback={<StoresSectionSkeleton />}>
        <StoresSection promises={stores} />
      </Suspense>
    </PageWrapper>
  );
}
