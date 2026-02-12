"use client";

import { Loader2, Navigation } from "lucide-react";
import type { Route } from "next";
import { use, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { StoreCard } from "@/app/(public)/predajne/store-card";
import { StoresMap } from "@/components/stores-map";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Store } from "@/features/stores/api/queries";
import { useGeolocation } from "@/hooks/use-geolocation";
import { sortStoresByDistance } from "@/lib/geo-utils";

type StoresSectionProps = {
  promises: Promise<Store[]>;
};

export function StoresSection({ promises }: StoresSectionProps) {
  const stores = use(promises);
  const { status, position, requestLocation, isLoading } = useGeolocation();

  const handleRequestLocation = () => {
    requestLocation();
  };

  // Show error toast when status changes to denied
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (status === "denied" && prevStatusRef.current !== "denied") {
      toast.error("Prístup k polohe bol zamietnutý", {
        description: "Povoľte prístup k polohe v nastaveniach prehliadača.",
        id: "geolocation-denied",
      });
    }
    prevStatusRef.current = status;
  }, [status]);

  const storesWithDistance = useMemo(() => {
    if (!position) {
      return stores.map((store) => ({
        ...store,
        distance: null as number | null,
      }));
    }
    return sortStoresByDistance(stores, position.latitude, position.longitude);
  }, [stores, position]);

  return (
    <>
      {/* Stores Grid */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="font-semibold text-2xl tracking-tight">
              Všetky predajne
            </h2>
            <p className="text-muted-foreground text-sm">
              {stores.length} predajní v 2 mestách
            </p>
          </div>
          <Button
            disabled={isLoading}
            onClick={handleRequestLocation}
            size="sm"
            variant={position ? "default" : "outline"}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Navigation className="size-4" />
            )}
            {position ? "Aktualizovať polohu" : "Zobraziť vzdialenosti"}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {storesWithDistance.map((store) => (
            <StoreCard
              distance={store.distance}
              href={`/predajne/${store.slug}` as Route}
              key={store.id}
              store={store}
              variant="default"
            />
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="space-y-4 pb-20">
        <div className="space-y-2">
          <h2 className="font-semibold text-2xl tracking-tight">Mapa</h2>
          <p className="text-muted-foreground">
            Nájdite nás na mape. Všetky naše predajne ponúkajú rovnaký sortiment
            čerstvého pečiva.
            <br />
            Vyber si tú, ktorá je bližšie k tebe.
          </p>
        </div>
        <div className="relative min-h-[500px] overflow-hidden rounded-md border border-border">
          <div className="absolute inset-0">
            <StoresMap stores={stores} userPosition={position} />
          </div>
        </div>
      </section>
    </>
  );
}

export function StoresSectionSkeleton() {
  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton
              className="h-[320px] rounded-md"
              key={`skeleton-${i.toString()}`}
            />
          ))}
        </div>
      </section>
      <section className="space-y-4 pb-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 w-full max-w-xl" />
        </div>
        <Skeleton className="min-h-[500px] rounded-md" />
      </section>
    </>
  );
}
