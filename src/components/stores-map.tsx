/** biome-ignore-all lint/style/noMagicNumbers: TODO: fix later */
/** biome-ignore-all lint/style/useNumericSeparators: TODO: fix later */
"use client";

import type { LatLngExpression } from "leaflet";
import { StoreNavigationButton } from "@/components/store-navigation-button";
import {
  Map as MapComponent,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import type { Store } from "@/features/stores/queries";
import type { GeolocationPosition } from "@/hooks/use-geolocation";
import { buildFullAddress } from "@/lib/geo-utils";

const CENTER_POSITION: LatLngExpression = [
  48.87668321440078, 21.256777795334994,
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
    <MapComponent center={CENTER_POSITION} key="stores-map" zoom={9}>
      <MapTileLayer />
      <MapZoomControl />
      {storesWithCoordinates.map((store) => {
        const storeLatLng: LatLngExpression = [
          Number.parseFloat(store.latitude ?? "0"),
          Number.parseFloat(store.longitude ?? "0"),
        ];
        return (
          <MapMarker key={store.id} position={storeLatLng}>
            <MapPopup>
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
            </MapPopup>
          </MapMarker>
        );
      })}
      {userPosition && (
        <MapMarker
          icon={<UserLocationMarker />}
          iconAnchor={[8, 8]}
          position={[userPosition.latitude, userPosition.longitude]}
        >
          <MapPopup>
            <p className="font-medium">Vaša poloha</p>
          </MapPopup>
        </MapMarker>
      )}
    </MapComponent>
  );
}
