"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { env } from "@/env";
import { useConsent } from "@/hooks/use-consent";
import { consent } from "@/lib/consent";
import { AuthIdentitySync } from "./auth-identity-sync";

// Initialize PostHog (disabled in development)
const IS_DEV = process.env.NODE_ENV === "development";

if (typeof window !== "undefined" && !IS_DEV) {
  // Prevent double-init in dev/HMR.
  // posthog-js exposes `__loaded` at runtime but it isn't typed.
  // biome-ignore lint/suspicious/noExplicitAny: needed for untyped runtime flag
  const alreadyInitialized = Boolean((posthog as any).__loaded);
  if (!alreadyInitialized) {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ph",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      capture_pageview: false,
      capture_pageleave: true,
      // Important setting:
      cookieless_mode: "on_reject",
    });
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Synchronize state on load
  useEffect(() => {
    const state = consent.client.get();

    if (state.decision === "decided") {
      if (state.snapshot.choices.analytics) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }
    // If decision === "unset" — cookieless mode is already working
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <AuthIdentitySync />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { analytics } = useConsent();

  useEffect(() => {
    if (pathname && analytics) {
      const url =
        window.location.origin +
        pathname +
        (searchParams.toString() ? `?${searchParams}` : "");
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, analytics]);

  return null;
}
