"use client";

import { StoreIcon } from "lucide-react";
import { lazy, Suspense } from "react";
import { StoreNavigationButton } from "@/components/store-navigation-button";
import {
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { Skeleton } from "@/components/ui/skeleton";
import type { Store } from "@/features/stores/api/queries";
import type { GeolocationPosition } from "@/hooks/use-geolocation";
import { buildFullAddress, formatStreetCity } from "@/lib/geo-utils";
import { cn } from "@/lib/utils";

type StoreWithCoords = Store & { lat: number; lng: number };

function toStoreWithCoords(store: Store): StoreWithCoords | null {
  const lat = Number.parseFloat(store.latitude ?? "");
  const lng = Number.parseFloat(store.longitude ?? "");
  if (
    !(Number.isFinite(lat) && Number.isFinite(lng)) ||
    lat === 0 ||
    lng === 0
  ) {
    return null;
  }
  return { ...store, lat, lng };
}

const MapComponent = lazy(() =>
  import("@/components/ui/map").then((m) => ({ default: m.Map }))
);

// Center coordinates [longitude, latitude] - mapcn uses lng,lat order
const CENTER_POSITION: [number, number] = [
  21.256_777_795_334_994, 48.876_683_214_400_78,
];

function UserLocationMarker() {
  return (
    <div className="relative flex size-4">
      <div className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-75" />
      <div className="relative inline-flex size-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
    </div>
  );
}

/** Distinctive bakery-style map pin: readable on light tiles, clear selected state. */
function StoreMarkerPin({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center drop-shadow-md",
        "duration-200 ease-out motion-safe:transition-[transform,filter] motion-reduce:duration-0",
        isSelected && "drop-shadow-lg motion-safe:z-10 motion-safe:scale-[1.08]"
      )}
    >
      <div
        className={cn(
          "relative flex size-10 items-center justify-center rounded-full border-2 border-white bg-linear-to-br shadow-md",
          isSelected
            ? "from-primary via-primary to-primary/90 text-primary-foreground ring-2 ring-primary/35 ring-offset-2 ring-offset-transparent"
            : "from-amber-50 via-white to-amber-100 text-amber-950 ring-1 ring-amber-950/12 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-950 dark:text-amber-50 dark:ring-white/15"
        )}
      >
        {isSelected ? (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10" />
        ) : null}
        <StoreIcon
          aria-hidden
          className="relative size-[1.15rem]"
          strokeWidth={2.35}
        />
      </div>
      <div
        aria-hidden
        className={cn(
          "-mt-2 flex h-2.5 w-2.5 rotate-45 items-center justify-center rounded-[2px] border-2 border-white shadow-sm",
          isSelected
            ? "bg-primary shadow-primary/20"
            : "bg-linear-to-br from-amber-100 to-amber-200/90 dark:from-zinc-700 dark:to-zinc-800"
        )}
      />
    </div>
  );
}

interface StoresMapProps {
  onMarkerClick?: (storeId: string) => void;
  routeCoordinates?: [number, number][];
  selectedStoreId?: string;
  stores: Store[];
  userPosition?: GeolocationPosition | null;
}

export function StoresMap({
  stores,
  userPosition,
  selectedStoreId,
  onMarkerClick,
  routeCoordinates,
}: StoresMapProps) {
  const plotted = stores
    .map(toStoreWithCoords)
    .filter((s): s is StoreWithCoords => s !== null);
  if (plotted.length === 0) {
    return null;
  }

  return (
    <div className="size-full">
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-md" />}>
        <MapComponent center={CENTER_POSITION} zoom={9}>
          <MapControls position="top-right" showLocate />
          {plotted.map((store) => {
            const isSelected = store.id === selectedStoreId;
            return (
              <MapMarker
                key={store.id}
                latitude={store.lat}
                longitude={store.lng}
                onClick={() => onMarkerClick?.(store.id)}
              >
                <MarkerContent>
                  <StoreMarkerPin isSelected={isSelected} />
                </MarkerContent>
                <MarkerPopup>
                  <div className="flex flex-col gap-2">
                    <div className="space-y-0.5">
                      <p className="font-medium">{store.name}</p>
                      {store.address ? (
                        <p className="text-muted-foreground text-sm">
                          {formatStreetCity(store.address)}
                        </p>
                      ) : null}
                    </div>
                    {store.address ? (
                      <StoreNavigationButton
                        address={buildFullAddress(store.address)}
                        latitude={store.latitude}
                        longitude={store.longitude}
                        variant="button"
                      />
                    ) : null}
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}
          {userPosition && (
            <MapMarker
              latitude={userPosition.latitude}
              longitude={userPosition.longitude}
            >
              <MarkerContent>
                <UserLocationMarker />
              </MarkerContent>
              <MarkerPopup>
                <p className="font-medium">Vaša poloha</p>
              </MarkerPopup>
            </MapMarker>
          )}
          {routeCoordinates && routeCoordinates.length > 1 && (
            <MapRoute
              color="#2563eb"
              coordinates={routeCoordinates}
              interactive={false}
              opacity={0.7}
              width={4}
            />
          )}
        </MapComponent>
      </Suspense>
    </div>
  );
}
