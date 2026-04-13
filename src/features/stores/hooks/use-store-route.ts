import { useEffect, useRef, useState } from "react";
import type { GeolocationPosition } from "@/hooks/use-geolocation";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

interface RouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
}

export function useStoreRoute(
  userPosition: GeolocationPosition | null | undefined,
  storeLat: string | null | undefined,
  storeLng: string | null | undefined
) {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!(userPosition && storeLat && storeLng)) {
      setRoute(null);
      return;
    }

    const lat = Number.parseFloat(storeLat);
    const lng = Number.parseFloat(storeLng);
    if (lat === 0 || lng === 0) {
      setRoute(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    const url = `${OSRM_BASE}/${userPosition.longitude},${userPosition.latitude};${lng},${lat}?overview=full&geometries=geojson`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.code !== "Ok" || !data.routes?.[0]) {
          setRoute(null);
          return;
        }
        const r = data.routes[0];
        setRoute({
          coordinates: r.geometry.coordinates as [number, number][],
          distanceKm: r.distance / 1000,
          durationMin: Math.round(r.duration / 60),
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRoute(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [userPosition, storeLat, storeLng]);

  return { route, isLoading };
}
