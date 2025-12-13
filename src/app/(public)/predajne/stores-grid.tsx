"use client";

import type { Route } from "next";
import { StoreCard } from "@/components/cards/store-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Store } from "@/lib/queries/stores";
import { useCustomerStore } from "@/store/customer-store";

export function StoresGrid({ stores }: { stores: Store[] }) {
  const selectedStore = useCustomerStore((state) => state.customerStore);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-2xl tracking-tight">
          Všetky predajne
        </h2>
        <p className="text-muted-foreground text-sm">
          {stores.length} predajní v 2 mestách
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stores?.map((store) => (
          <StoreCard
            href={`/predajne/${store.slug}` as Route}
            isSelected={selectedStore?.id === store.id}
            key={store.id}
            store={store}
            variant="default"
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
