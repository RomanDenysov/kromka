import "server-only";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import type {
  ActivityAction,
  ActivityActorType,
  ActivityEntityType,
  ActivityMetadata,
} from "@/db/types";
import { log } from "@/lib/logger";

interface LogActivityInput {
  action: ActivityAction;
  actor?: {
    id?: string | null;
    type: ActivityActorType;
    label?: string | null;
  };
  entityId: string;
  entityType: ActivityEntityType;
  metadata?: ActivityMetadata;
  /** Pre-rendered Slovak line for the feed (e.g. "Nová objednávka · #OBJ-..."). */
  summary?: string;
}

/**
 * Append an entry to the cross-entity activity feed.
 *
 * Fire-and-forget: the insert runs inside `after()` so it never delays the
 * response, and a failure is logged rather than thrown - a broken audit write
 * must never fail the business action that triggered it.
 */
export function logActivity(input: LogActivityInput): void {
  after(async () => {
    try {
      await db.insert(activityLog).values({
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: input.actor?.id ?? null,
        actorType: input.actor?.type ?? "system",
        actorLabel: input.actor?.label ?? null,
        summary: input.summary ?? null,
        metadata: input.metadata ?? null,
      });
      updateTag("activity");
    } catch (err) {
      log.db.error(
        { err, action: input.action, entityId: input.entityId },
        "Failed to write activity log entry"
      );
    }
  });
}
