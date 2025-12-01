"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { type Store, StoreCard } from "@/components/cards/store-card";
import { StoreSelectModal } from "@/components/modal/store-select-modal";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUser } from "@/hooks/use-get-user";
import { useTRPC } from "@/trpc/client";

export default function StoresPage() {
  const trpc = useTRPC();

  const { data: stores, isLoading: isLoadingStores } = useQuery(
    trpc.public.stores.list.queryOptions()
  );

  const { data: user, isLoading: isLoadingUser } = useGetUser();
  const userDefaultStoreId = isLoadingUser
    ? null
    : (user?.storeMembers?.[0]?.storeId ?? null);

  const userStore = userDefaultStoreId
    ? (stores?.find((store) => store.id === userDefaultStoreId) ?? null)
    : null;

  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Predajne" }]} />

      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-neutral-900">
          {/* Background - можно заменить на реальное изображение */}
          <div className="absolute inset-0">
            <Image
              alt="Naše predajne"
              className="object-cover opacity-40"
              fill
              src="/images/stores-hero.jpg" // замени на актуальный путь
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
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
              <div className="mt-8">
                {isLoadingUser ? (
                  <Skeleton className="h-12 w-48 rounded-full bg-white/10" />
                  // biome-ignore lint/style/noNestedTernary: <explanation>
                ) : userDefaultStoreId ? (
                  <StoreSelectModal>
                    <button
                      className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-medium text-neutral-900 transition-transform hover:scale-105"
                      type="button"
                    >
                      <MapPin className="size-4" />
                      <span>
                        {
                          (
                            stores?.find(
                              (store) => store.id === userDefaultStoreId
                            ) as unknown as Store
                          ).name
                        }
                      </span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-500 text-sm">Zmeniť</span>
                    </button>
                  </StoreSelectModal>
                ) : (
                  <StoreSelectModal>
                    <Button
                      className="rounded-full px-6"
                      size="lg"
                      variant="secondary"
                    >
                      <MapPin className="size-4" />
                      Vybrať predajňu
                    </Button>
                  </StoreSelectModal>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stores Grid - Bento style */}
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-bold text-2xl tracking-tight">
                Všetky predajne
              </h2>
              <p className="mt-1 text-muted-foreground">
                {stores?.length ?? 0} predajní v 2 mestách
              </p>
            </div>
          </div>

          {isLoadingStores ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton
                  className="h-[280px] rounded-2xl bg-neutral-100 dark:bg-neutral-800"
                  key={`skeleton-${i.toString()}`}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {stores?.map((store, index) => (
                <StoreCard
                  href={`/predajne/${store.slug}` as Route}
                  isSelected={userStore?.id === store.id}
                  key={store.id}
                  store={store}
                  variant={index === 0 ? "featured" : "default"}
                />
              ))}
            </div>
          )}
        </section>

        {/* Optional: Map section or additional info */}
        <section className="rounded-2xl bg-neutral-100 p-8 dark:bg-neutral-900">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-semibold text-xl">Nevieš sa rozhodnúť?</h3>
            <p className="mt-2 text-muted-foreground">
              Obe naše predajne ponúkajú rovnaký sortiment čerstvého pečiva.
              Vyber si tú, ktorá je bližšie k tebe.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline">Zobraziť na mape</Button>
              <Button variant="ghost">Kontaktovať nás</Button>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
