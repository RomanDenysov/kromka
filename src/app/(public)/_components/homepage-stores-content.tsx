"use client";

import { ArrowRight, Car, ChevronRight, Clock, MapPin } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useCallback, useMemo } from "react";
import { HomepageCtaLink } from "@/components/analytics/homepage-cta-tracked";
import { StoresMap } from "@/components/stores-map";
import { buttonVariants } from "@/components/ui/button";
import { DistanceBadge } from "@/components/ui/distance-badge";
import type { Store } from "@/features/stores/api/queries";
import { StorePicker } from "@/features/stores/components/store-picker";
import { STORE_IMAGE_FALLBACK_SRC } from "@/features/stores/constants";
import { useStoreRoute } from "@/features/stores/hooks/use-store-route";
import {
  formatTimeRange,
  getTodaySchedule,
  isCurrentlyOpen,
} from "@/features/stores/lib/store-hours-display";
import {
  usePreferredStoreId,
  useSetPreferredStore,
} from "@/features/stores/store/preferred-store";
import { useGeolocation } from "@/hooks/use-geolocation";
import { formatStreetCity, sortStoresByDistance } from "@/lib/geo-utils";
import { cn } from "@/lib/utils";

interface HomepageStoresContentProps {
  initialStoreId: string;
  stores: Store[];
}

export function HomepageStoresContent({
  stores,
  initialStoreId,
}: HomepageStoresContentProps) {
  const preferredStoreId = usePreferredStoreId();
  const setPreferredStore = useSetPreferredStore();
  const { position } = useGeolocation();

  const storesWithDistance = useMemo(() => {
    if (!position) {
      return stores.map((s) => ({ ...s, distance: null }));
    }
    return sortStoresByDistance(stores, position.latitude, position.longitude);
  }, [stores, position]);

  const nearestStoreId = useMemo(() => {
    if (!position || storesWithDistance.length === 0) {
      return null;
    }
    return storesWithDistance[0].id;
  }, [position, storesWithDistance]);

  const selectedStoreId = preferredStoreId ?? nearestStoreId ?? initialStoreId;

  const selectedEntry = storesWithDistance.find(
    (s) => s.id === selectedStoreId
  );
  const selectedStore = selectedEntry ?? storesWithDistance[0];

  const handleStoreSelect = useCallback(
    (storeId: string) => {
      setPreferredStore(storeId);
    },
    [setPreferredStore]
  );

  const { route } = useStoreRoute(
    position,
    selectedStore.latitude,
    selectedStore.longitude
  );

  const todaySchedule = getTodaySchedule(selectedStore.openingHours);
  const storeOpen = isCurrentlyOpen(todaySchedule);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-balance font-semibold text-xl tracking-tight md:text-2xl">
          Nase predajne
        </h2>
        <HomepageCtaLink
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground"
          )}
          cta="view_all_stores"
          href="/predajne"
          section="homepage_stores_map"
        >
          Zobraziť všetky
          <ArrowRight className="size-3.5" />
        </HomepageCtaLink>
      </div>

      {/* Map with floating store panel */}
      <div className="relative overflow-hidden rounded-md border">
        {/* Map fills entire section */}
        <div className="h-[450px] md:h-[480px]">
          <StoresMap
            onMarkerClick={handleStoreSelect}
            routeCoordinates={route?.coordinates}
            selectedStoreId={selectedStoreId}
            stores={stores}
            userPosition={position}
          />
        </div>

        {/* Floating store info panel */}
        <div className="absolute right-3 bottom-3 left-3 z-10 md:right-auto md:bottom-4 md:left-4 md:w-80">
          <div className="rounded-md border bg-background/95 shadow-lg backdrop-blur-sm">
            {/* Selected store header with image */}
            <HomepageCtaLink
              className="group flex gap-3 p-3"
              cta="store_detail"
              href={`/predajne/${selectedStore.slug}` as Route}
              section="homepage_stores_map"
              store_slug={selectedStore.slug}
            >
              {/* Thumbnail */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  alt={selectedStore.name}
                  className="size-14 object-cover transition-transform duration-300 group-hover:scale-110"
                  fill
                  sizes="56px"
                  src={selectedStore.image?.url ?? STORE_IMAGE_FALLBACK_SRC}
                />
              </div>

              {/* Store info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-balance font-semibold text-sm">
                    {selectedStore.name}
                  </h3>
                  <div
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      storeOpen ? "bg-green-500" : "bg-neutral-400"
                    )}
                  />
                  {selectedStore.distance !== null &&
                    Number.isFinite(selectedStore.distance) && (
                      <DistanceBadge
                        className="ml-auto"
                        distance={selectedStore.distance}
                        variant="light"
                      />
                    )}
                </div>

                {selectedStore.address ? (
                  <div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">
                      {formatStreetCity(selectedStore.address)}
                    </span>
                  </div>
                ) : null}

                <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Clock className="size-3 shrink-0" />
                  <span>Dnes: {formatTimeRange(todaySchedule)}</span>
                </div>

                {route && (
                  <div className="mt-0.5 flex items-center gap-1.5 text-blue-600 text-xs dark:text-blue-400">
                    <Car className="size-3 shrink-0" />
                    <span>
                      {route.durationMin} min ({route.distanceKm.toFixed(1)} km)
                    </span>
                  </div>
                )}
              </div>

              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </HomepageCtaLink>

            {/* Store switcher - compact bar at bottom */}
            <div className="w-full overflow-hidden border-t">
              <StorePicker
                onSelect={handleStoreSelect}
                selectedStoreId={selectedStoreId}
                stores={storesWithDistance}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
