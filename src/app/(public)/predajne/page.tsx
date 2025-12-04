import Image from "next/image";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { StoresMap } from "@/components/stores-map";
import { Skeleton } from "@/components/ui/skeleton";
import { getStores } from "@/lib/queries/stores";
import { HydrateClient } from "@/trpc/server";
import { QuickStoreSelector } from "./quick-store-selector";
import { StoresGrid, StoresGridSkeleton } from "./stores-grid";

export default async function StoresPage() {
  const stores = await getStores();
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Predajne" }]} />

      <div className="space-y-16">
        <HydrateClient>
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-md bg-primary">
            {/* Background - real image */}
            <div className="absolute inset-0">
              <Image
                alt="Naše predajne"
                className="object-cover opacity-40"
                fill
                src="/images/stores-hero.jpg" // replace with actual path
              />
              <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
            </div>

            <div className="relative px-8 py-16 md:px-12 md:py-24">
              <div className="max-w-xl">
                <p className="text-sm text-white/60 uppercase tracking-wider">
                  Kde nás nájdete
                </p>
                <h1 className="mt-3 font-bold text-4xl text-white md:text-5xl">
                  Naše predajne
                </h1>
                <p className="mt-4 text-lg text-white/70 leading-relaxed">
                  Navštívte nás v Košiciach alebo Prešove. Čerstvé pečivo každý
                  deň od skorého rána.
                </p>

                {/* Quick store selector */}
                <ErrorBoundary
                  fallback={
                    <div className="mt-8">
                      <Skeleton className="h-12 w-48 rounded-full" />
                    </div>
                  }
                >
                  <Suspense
                    fallback={
                      <div className="mt-8">
                        <Skeleton className="h-12 w-48 rounded-full" />
                      </div>
                    }
                  >
                    <QuickStoreSelector />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </section>

          {/* Stores Grid - Bento style */}
          <ErrorBoundary fallback={<StoresGridSkeleton />}>
            <Suspense fallback={<StoresGridSkeleton />}>
              <StoresGrid stores={stores} />
            </Suspense>
          </ErrorBoundary>

          {/* Optional: Map section or additional info */}
          <section className="relative min-h-[500px] overflow-hidden rounded-md bg-neutral-100 p-8 dark:bg-neutral-900">
            <div className="z-10 mx-auto max-w-2xl text-center">
              <h3 className="font-semibold text-xl">Nevieš sa rozhodnúť?</h3>
              <p className="mt-2 text-muted-foreground">
                Všetky naše predajne ponúkajú rovnaký sortiment čerstvého
                pečiva. Vyber si tú, ktorá je bližšie k tebe.
              </p>
            </div>
            <div className="absolute inset-0">
              <ErrorBoundary fallback={<Skeleton className="size-full" />}>
                <Suspense fallback={<Skeleton className="size-full" />}>
                  <StoresMap />
                </Suspense>
              </ErrorBoundary>
            </div>
          </section>
        </HydrateClient>
      </div>
    </PageWrapper>
  );
}
