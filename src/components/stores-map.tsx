/** biome-ignore-all lint/style/noMagicNumbers: TODO: fix later */
/** biome-ignore-all lint/style/useNumericSeparators: TODO: fix later */
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { LatLngExpression } from "leaflet";
import {
  Map as MapComponent,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { useTRPC } from "@/trpc/client";

const CENTER_POSITION: LatLngExpression = [
  48.87668321440078, 21.256777795334994,
];

const KROMKA_GALERIA: LatLngExpression = [
  48.996481367600325, 21.24079585579881,
];
const KROMKA_NOVEMBRA: LatLngExpression = [
  48.98957989432406, 21.23652391347003,
];
const KROMKA_MASARYKOVA: LatLngExpression = [
  48.729060094915866, 21.26135284044803,
];
const KROMKA_KUZMANYHO: LatLngExpression = [
  48.726252854393714, 21.249413055790967,
];

export function StoresMap() {
  const trpc = useTRPC();
  const { data: stores } = useSuspenseQuery(
    trpc.public.stores.list.queryOptions()
  );
  if (stores.length === 0) {
    return null;
  }

  return (
    <MapComponent center={CENTER_POSITION} zoom={9}>
      <MapTileLayer />
      <MapZoomControl />
      {stores.map((store) => {
        const storeLatLng: LatLngExpression = [
          Number.parseFloat(store.latitude ?? "0") ?? 0,
          Number.parseFloat(store.longitude ?? "0") ?? 0,
        ];
        return (
          <MapMarker key={store.id} position={storeLatLng}>
            <MapPopup>
              <div className="flex flex-col gap-0.5">
                <p className="font-medium">{store.name}</p>
                {store.address && (
                  <div>
                    <p>{store.address.street}</p>
                    <p>{store.address.city}</p>
                    <p>{store.address.postalCode}</p>
                    <p>{store.address.country}</p>
                  </div>
                )}
              </div>
            </MapPopup>
          </MapMarker>
        );
      })}
      <MapMarker position={KROMKA_GALERIA}>
        <MapPopup>Kromka Galéria</MapPopup>
      </MapMarker>
      <MapMarker position={KROMKA_NOVEMBRA}>
        <MapPopup>Kromka Novémbra</MapPopup>
      </MapMarker>
      <MapMarker position={KROMKA_MASARYKOVA}>
        <MapPopup>Kromka Masarykova</MapPopup>
      </MapMarker>
      <MapMarker position={KROMKA_KUZMANYHO}>
        <MapPopup>Kromka Kuzmanyho</MapPopup>
      </MapMarker>
    </MapComponent>
  );
}
