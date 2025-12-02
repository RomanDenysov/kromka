"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { StoreCard } from "@/components/cards/store-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";

export function StoresGrid() {
  const trpc = useTRPC();
  const { data: stores } = useSuspenseQuery(
    trpc.public.stores.list.queryOptions()
  );
  const { data: user } = useSuspenseQuery(trpc.public.users.me.queryOptions());
  const userDefaultStoreId = user?.storeMembers?.[0]?.storeId ?? null;
  const userStore = userDefaultStoreId
    ? (stores?.find((store) => store.id === userDefaultStoreId) ?? null)
    : null;
  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Všetky predajne</h2>
          <p className="mt-1 text-muted-foreground">
            {stores.length} predajní v 2 mestách
          </p>
        </div>
      </div>
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
    </section>
  );
}

export function StoresGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton
          className="h-[280px] rounded-md"
          key={`skeleton-${i.toString()}`}
        />
      ))}
    </div>
  );
}
