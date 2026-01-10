"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { useSession } from "@/features/auth/client";
import { useConsent } from "@/hooks/use-consent";

/**
 * Syncs Better Auth user (including anonymous users) with PostHog `identify`.
 * Uses Better Auth's user.id as the distinct_id and attaches basic properties.
 */
export function AuthIdentitySync() {
  const { data: session, isPending } = useSession();
  const { analytics } = useConsent();

  const lastIdentifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      return;
    }

    const user = session?.user;

    // Only identify when analytics tracking is enabled and we have a user
    if (!(analytics && user)) {
      return;
    }

    // Avoid repeated identify calls for the same user id
    if (user.id === lastIdentifiedId.current) {
      return;
    }

    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
    });

    lastIdentifiedId.current = user.id;
  }, [analytics, isPending, session]);

  return null;
}
