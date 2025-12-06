"use client";

import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { consent } from "@/lib/consent";
import { AuthIdentitySync } from "./auth-identity-sync";

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
