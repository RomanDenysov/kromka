"use client";

import dynamic from "next/dynamic";
import { MapControls, MapMarker, MarkerContent } from "@/components/ui/map";
import { Skeleton } from "@/components/ui/skeleton";

const PlaygroundMap = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    loading: () => <Skeleton className="h-[200px] w-full rounded-md" />,
    ssr: false,
  }
);

/** Košice okolie — rovnaký stred ako predajne na mape. */
const CENTER: [number, number] = [
  21.256_777_795_334_994, 48.876_683_214_400_78,
];

export function MapPlayground() {
  return (
    <div className="h-[220px] w-full max-w-xl overflow-hidden rounded-md border">
      <PlaygroundMap center={CENTER} zoom={10}>
        <MapControls position="top-right" />
        <MapMarker latitude={CENTER[1]} longitude={CENTER[0]}>
          <MarkerContent>
            <div className="size-3 rounded-full border-2 border-white bg-brand shadow-md" />
          </MarkerContent>
        </MapMarker>
      </PlaygroundMap>
    </div>
  );
}
