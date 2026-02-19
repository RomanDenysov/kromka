"use client";

import dynamic from "next/dynamic";
import { StoreNavigationButton } from "@/components/store-navigation-button";
import {
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { Skeleton } from "@/components/ui/skeleton";
import type { Store } from "@/features/stores/api/queries";
import type { GeolocationPosition } from "@/hooks/use-geolocation";
import { buildFullAddress } from "@/lib/geo-utils";

const MapComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
  }
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

type StoresMapProps = {
  stores: Store[];
  userPosition?: GeolocationPosition | null;
};

export function StoresMap({ stores, userPosition }: StoresMapProps) {
  // Filter stores with valid coordinates
  const storesWithCoordinates = stores.filter(
    (store) =>
      store.latitude &&
      store.longitude &&
      Number.parseFloat(store.latitude) !== 0 &&
      Number.parseFloat(store.longitude) !== 0
  );
  if (storesWithCoordinates.length === 0) {
    return null;
  }

  return (
    <div className="size-full">
      <MapComponent center={CENTER_POSITION} zoom={9}>
        <MapControls position="bottom-right" />
        {storesWithCoordinates.map((store) => (
          <MapMarker
            key={store.id}
            latitude={Number.parseFloat(store.latitude ?? "0")}
            longitude={Number.parseFloat(store.longitude ?? "0")}
          >
            <MarkerContent />
            <MarkerPopup>
              <div className="flex flex-col gap-2">
                <div className="space-y-0.5">
                  <p className="font-medium">{store.name}</p>
                  {store.address && (
                    <p className="text-muted-foreground text-sm">
                      {[store.address.street, store.address.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
                {store.address && (
                  <StoreNavigationButton
                    address={buildFullAddress(store.address)}
                    latitude={store.latitude}
                    longitude={store.longitude}
                    variant="button"
                  />
                )}
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
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
      </MapComponent>
    </div>
  );
}
