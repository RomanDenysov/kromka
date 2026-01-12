import "server-only";

import { PostHog } from "posthog-node";
import { env } from "@/env";

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Server-side PostHog client (Node SDK).
 * Returns null in development mode.
 *
 * Note: `NEXT_PUBLIC_POSTHOG_HOST` should be the **ingestion** host (e.g. `https://eu.i.posthog.com`),
 * not the UI host (`https://eu.posthog.com`).
 *
 * In serverless environments, prefer calling `await posthog.shutdown()` after capturing to ensure
 * the event queue is flushed before the function exits.
 */
export default function PostHogClient(): PostHog | null {
  if (IS_DEV) {
    return null;
  }

  const posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}
