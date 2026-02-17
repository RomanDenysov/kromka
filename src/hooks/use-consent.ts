"use client";

import posthog from "posthog-js";
import { useCallback, useSyncExternalStore } from "react";
import { consent } from "@/lib/consent";

const getSnapshot = () => consent.client.get();

export function useConsent() {
  const state = useSyncExternalStore(
    consent.client.subscribe,
    getSnapshot,
    consent.client.getServerSnapshot
  );

  const consentGiven = state.decision === "decided";
  const analytics =
    state.decision === "decided" ? state.snapshot.choices.analytics : false;

  const acceptAll = useCallback(() => {
    consent.client.set({ analytics: true });
    posthog.set_config({ persistence: "localStorage+cookie" });
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
  }, []);

  const acceptNecessary = useCallback(() => {
    consent.client.set({ analytics: false });
    posthog.opt_out_capturing();
    posthog.stopSessionRecording();
  }, []);

  const reset = useCallback(() => {
    consent.client.clear();
    posthog.reset();
  }, []);

  return {
    state,
    consentGiven,
    analytics,
    acceptAll,
    acceptNecessary,
    reset,
  };
}
