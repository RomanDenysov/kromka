"use client";

import { useQuery } from "@tanstack/react-query";
import { StoreIcon } from "lucide-react";
import type { Route } from "next";
import { type Store, StoreCard } from "@/components/cards/store-card";
import { StoreSelectModal } from "@/components/modal/store-select-modal";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

export default function StoresPage() {
  const trpc = useTRPC();

  const { data: stores, isLoading: isLoadingStores } = useQuery(
    trpc.public.stores.list.queryOptions()
  );

  const { data: userStore, isLoading: isLoadingUserStore } = useQuery(
    trpc.public.stores.getUserStore.queryOptions()
  );

  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "Predajne" }]} />

      <div className="space-y-12">
        <div className="space-y-6">
          <h1 className="font-bold text-3xl tracking-tight">Predajne</h1>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-primary">
                <StoreIcon className="size-5" />
                <h2 className="font-semibold text-lg">Vybraný obchod</h2>
              </div>

              {isLoadingUserStore ? (
                <Skeleton className="h-[340px] w-full max-w-sm rounded-xl" />
                // biome-ignore lint/style/noNestedTernary: Ignore it for now
              ) : userStore ? (
                <div className="max-w-sm">
                  <StoreSelectModal>
                    {/* Wrapper div to act as trigger since StoreSelectModal passes props to child */}
                    <div className="cursor-pointer transition-transform hover:scale-[1.02]">
                      <StoreCard
                        isActive
                        store={userStore as unknown as Store}
                      />
                    </div>
                  </StoreSelectModal>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4 py-4">
                  <p className="max-w-md text-muted-foreground">
                    Momentálne nemáte vybranú žiadnu predajňu. Vyberte si
                    predajňu pre zobrazenie aktuálnej ponuky a dostupnosti.
                  </p>
                  <StoreSelectModal>
                    <Button size="lg">Vybrať predajňu</Button>
                  </StoreSelectModal>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-bold text-2xl tracking-tight">Všetky predajne</h2>
          {isLoadingStores ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton key
                <Skeleton className="h-[340px] rounded-xl" key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {stores?.map((store) => (
                <StoreCard
                  href={`/predajne/${store.slug}` as Route}
                  key={store.id}
                  store={store}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
