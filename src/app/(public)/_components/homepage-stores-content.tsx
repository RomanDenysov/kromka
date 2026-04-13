"use client";

import { startOfToday } from "date-fns";
import { ArrowRight, Car, ChevronRight, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StoresMap } from "@/components/stores-map";
import { buttonVariants } from "@/components/ui/button";
import { DistanceBadge } from "@/components/ui/distance-badge";
import type { TimeRange } from "@/db/types";
import {
  getTimeRangeForDate,
  parseTimeToMinutes,
} from "@/features/checkout/utils";
import type { Store } from "@/features/stores/api/queries";
import { StorePicker } from "@/features/stores/components/store-picker";
import { useStoreRoute } from "@/features/stores/hooks/use-store-route";
import {
  usePreferredStoreId,
  useSetPreferredStore,
} from "@/features/stores/store/preferred-store";
import { useGeolocation } from "@/hooks/use-geolocation";
import { sortStoresByDistance } from "@/lib/geo-utils";
import { cn } from "@/lib/utils";

const getTodaySchedule = (openingHours: Store["openingHours"]) => {
  if (!openingHours) {
    return null;
  }
  return getTimeRangeForDate(startOfToday(), openingHours);
};

const isCurrentlyOpen = (schedule: TimeRange | null): boolean => {
  if (!schedule) {
    return false;
  }
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    currentMinutes >= parseTimeToMinutes(schedule.start) &&
    currentMinutes < parseTimeToMinutes(schedule.end)
  );
};

const formatTimeRange = (schedule: TimeRange | null) => {
  if (!schedule) {
    return "Zatvorene";
  }
  return `${schedule.start} - ${schedule.end}`;
};

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

  const [geoStoreId, setGeoStoreId] = useState<string | null>(null);
  const selectedStoreId = preferredStoreId ?? geoStoreId ?? initialStoreId;

  const storesWithDistance = useMemo(() => {
    if (!position) {
      return stores.map((s) => ({ ...s, distance: null }));
    }
    return sortStoresByDistance(stores, position.latitude, position.longitude);
  }, [stores, position]);

  useEffect(() => {
    if (!position || storesWithDistance.length === 0) {
      return;
    }
    const nearest = storesWithDistance[0];
    if (nearest.distance !== null) {
      setGeoStoreId(nearest.id);
    }
  }, [position, storesWithDistance]);

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
        <Link
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground"
          )}
          href="/predajne"
        >
          Zobraziť všetky
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Map with floating store panel */}
      <div className="relative overflow-hidden rounded-xl border">
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
          <div className="rounded-lg border bg-background/95 shadow-lg backdrop-blur-sm">
            {/* Selected store header with image */}
            <Link
              className="group flex gap-3 p-3"
              href={`/predajne/${selectedStore.slug}` as never}
            >
              {/* Thumbnail */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {selectedStore.image?.url ? (
                  <Image
                    alt={selectedStore.name}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    fill
                    sizes="56px"
                    src={selectedStore.image.url}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                )}
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

                {selectedStore.address && (
                  <div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">
                      {[
                        selectedStore.address.street,
                        selectedStore.address.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

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
            </Link>

            {/* Store switcher - compact bar at bottom */}
            <div className="border-t px-3 py-2">
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
