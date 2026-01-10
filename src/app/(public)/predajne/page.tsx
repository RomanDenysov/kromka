import { Suspense } from "react";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { StoresMap } from "@/components/stores-map";
import { Skeleton } from "@/components/ui/skeleton";
import { getStores } from "@/features/stores/queries";
import { StoresGrid, StoresGridSkeleton } from "./stores-grid";

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

        {/* Stores Grid */}
        <Suspense fallback={<StoresGridSkeleton />}>
          <StoresGrid stores={stores} />
        </Suspense>

        {/* Map Section - Minimal */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="font-semibold text-2xl tracking-tight">Mapa</h2>
            <p className="text-muted-foreground">
              Nájdite nás na mape. Všetky naše predajne ponúkajú rovnaký
              sortiment čerstvého pečiva.
              <br />
              Vyber si tú, ktorá je bližšie k tebe.
            </p>
          </div>
          <div className="relative min-h-[500px] overflow-hidden rounded-md border border-border">
            <div className="absolute inset-0">
              <Suspense fallback={<Skeleton className="size-full" />}>
                <StoresMap stores={stores} />
              </Suspense>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
