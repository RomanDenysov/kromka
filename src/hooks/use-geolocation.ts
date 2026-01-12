"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "krmk-geolocation-granted";
const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 300_000, // 5 minutes cache
};

export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export type GeolocationPosition = {
  latitude: number;
  longitude: number;
};

type GeolocationState = {
  status: GeolocationStatus;
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    position: null,
    error: null,
  });

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        status: "unavailable",
        position: null,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, status: "requesting" }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setState({
          status: "granted",
          position: newPosition,
          error: null,
        });
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {
          // localStorage not available
        }
      },
      (error) => {
        const status: GeolocationStatus =
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable";
        setState({
          status,
          position: null,
          error,
        });
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // localStorage not available
        }
      },
      POSITION_OPTIONS
    );
  }, []);

  const requestLocation = useCallback(() => {
    fetchPosition();
  }, [fetchPosition]);

  const clearLocation = useCallback(() => {
    setState({
      status: "idle",
      position: null,
      error: null,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage not available
    }
  }, []);

  // Auto-refresh position on mount if previously granted
  useEffect(() => {
    try {
      const wasGranted = localStorage.getItem(STORAGE_KEY) === "true";
      if (wasGranted) {
        fetchPosition();
      }
    } catch {
      // localStorage not available
    }
  }, [fetchPosition]);

  return {
    ...state,
    requestLocation,
    clearLocation,
    isLoading: state.status === "requesting",
    hasPosition: state.position !== null,
  };
}
