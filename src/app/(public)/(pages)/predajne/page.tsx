import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import type { StoreSchedule } from "@/db/types";
import { getStores } from "@/features/stores/api/queries";
import { createMetadata } from "@/lib/metadata";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/utils";
import { StoresSection, StoresSectionSkeleton } from "./stores-section";

export const metadata: Metadata = createMetadata({
  title: "Predajne Pekárne Kromka v Prešove a Košiciach",
  description:
    "Navštívte Pekáreň Kromka v Prešove alebo Košiciach. Čerstvý kváskový chlieb a pečivo každý deň od skorého rána. Adresy, otváracie hodiny a kontakt.",
  canonicalUrl: getSiteUrl("/predajne"),
});

export default async function StoresPage() {
  const storesPromise = getStores();
  const stores = await storesPromise;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Predajne", href: "/predajne" },
  ]);
  const localBusinessSchemas = stores.map((store) =>
    getLocalBusinessSchema({
      name: store.name,
      description: store.description?.content?.[0]?.content?.[0]?.text ?? null,
      slug: store.slug,
      address: store.address,
      phone: store.phone,
      email: store.email,
      latitude: store.latitude,
      longitude: store.longitude,
      openingHours: store.openingHours as StoreSchedule | null | undefined,
      image: store.image?.url ?? null,
    })
  );

  return (
    <PageWrapper>
      <JsonLd data={[breadcrumbSchema, ...localBusinessSchemas]} />
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
        <StoresSection promises={storesPromise} />
      </Suspense>
    </PageWrapper>
  );
}
