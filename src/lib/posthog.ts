import "server-only";

import { PostHog } from "posthog-node";
import { env } from "@/env";
import { logger } from "@/lib/logger";

const IS_DEV = process.env.NODE_ENV === "development";

let posthogClient: PostHog | null = null;

function getPostHogClient(): PostHog | null {
  if (IS_DEV) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

export default getPostHogClient;

// biome-ignore lint/suspicious/useAwait: async needed so callers can .catch() - client.capture is sync fire-and-forget
export async function captureServerEvent(
  distinctId: string | null | undefined,
  event: string,
  properties?: Record<string, unknown>
) {
  if (!distinctId) {
    logger.warn({ event }, "Skipping PostHog event: no distinctId");
    return;
  }

  const client = getPostHogClient();
  if (!client) {
    return;
  }

  try {
    client.capture({ distinctId, event, properties });
  } catch (err) {
    logger.warn({ err, event, distinctId }, "Failed to capture PostHog event");
  }
}
