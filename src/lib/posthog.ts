import "server-only";

import { PostHog } from "posthog-node";
import { env } from "@/env";
import { log } from "@/lib/logger";

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

export async function captureServerEvent(
	distinctId: string | null | undefined,
	event: string,
	properties?: Record<string, unknown>,
) {
	if (!distinctId) {
		return;
	}

	const client = getPostHogClient();
	if (!client) {
		return;
	}

	try {
		client.capture({ distinctId, event, properties });
		await client.flush();
	} catch (err) {
		log.db.error({ err, event }, "Failed to capture PostHog server event");
	}
}
