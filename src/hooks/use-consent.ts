"use client";

import { useCallback, useSyncExternalStore } from "react";
import { consent } from "@/lib/consent";

function subscribe(callback: () => void) {
  window.addEventListener("consent-change", callback);
  return () => window.removeEventListener("consent-change", callback);
}

function getSnapshot() {
  return consent.client.get();
}

function getServerSnapshot() {
  return { decision: "unset" as const };
}

export function useConsent() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const acceptAll = useCallback(() => {
    consent.client.set({ analytics: true });
    window.dispatchEvent(new Event("consent-change"));
  }, []);

  const acceptNecessary = useCallback(() => {
    consent.client.set({ analytics: false });
    window.dispatchEvent(new Event("consent-change"));
  }, []);

  const reset = useCallback(() => {
    consent.client.clear();
    window.dispatchEvent(new Event("consent-change"));
  }, []);

  return {
    state,
    consentGiven: state.decision === "decided",
    analytics:
      state.decision === "decided" ? state.snapshot.choices.analytics : false,
    acceptAll,
    acceptNecessary,
    reset,
  };
}
