"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { consent } from "@/lib/consent";
import { AuthIdentitySync } from "./auth-identity-sync";

// Initialize PostHog
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  // biome-ignore lint/style/noNonNullAssertion: we need to use the namespace import for PostHog
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ph",
    ui_host: "https://eu.posthog.com",
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
    capture_pageview: false,
    capture_pageleave: true,
    // Ключова настройка:
    cookieless_mode: "on_reject",
  });
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

  useEffect(() => {
    if (pathname) {
      const url =
        window.origin +
        pathname +
        (searchParams.toString() ? `?${searchParams}` : "");
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}
