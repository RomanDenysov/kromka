import "server-only";

import { and, desc, eq, isNotNull, isNull, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import type { ActivityEntityType, ActivityRole } from "@/db/types";

const RECENT_ACTIVITY_LIMIT = 12;
const ACTIVITY_FEED_LIMIT = 100;

export type ActivityEntry = Awaited<
  ReturnType<typeof getRecentActivity>
>[number];

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getRecentActivity(limit: number = RECENT_ACTIVITY_LIMIT) {
  "use cache";
  cacheLife("minutes");
  cacheTag("activity");

  return db.query.activityLog.findMany({
    orderBy: [desc(activityLog.createdAt)],
    limit,
  });
}

/** Translate a derived display role into stored-column conditions. */
function roleCondition(role: ActivityRole): SQL | undefined {
  switch (role) {
    case "staff":
      return eq(activityLog.actorType, "staff");
    case "system":
      return eq(activityLog.actorType, "system");
    case "user":
      return and(
        eq(activityLog.actorType, "customer"),
        isNotNull(activityLog.actorId)
      );
    case "guest":
      return and(
        eq(activityLog.actorType, "customer"),
        isNull(activityLog.actorId)
      );
    default:
      return undefined;
  }
}

export interface ActivityFeedFilters {
  entity?: ActivityEntityType | null;
  limit?: number;
  role?: ActivityRole | null;
}

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getActivityFeed(filters: ActivityFeedFilters = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("activity");

  const conditions: SQL[] = [];
  if (filters.entity) {
    conditions.push(eq(activityLog.entityType, filters.entity));
  }
  if (filters.role) {
    const condition = roleCondition(filters.role);
    if (condition) {
      conditions.push(condition);
    }
  }

  return db.query.activityLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(activityLog.createdAt)],
    limit: filters.limit ?? ACTIVITY_FEED_LIMIT,
  });
}
