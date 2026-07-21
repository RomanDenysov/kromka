import "server-only";

import { count, eq } from "drizzle-orm";
import type { Route } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { b2bApplications, postComments } from "@/db/schema";
import {
  getCartsCount,
  getOrdersCount,
} from "@/features/admin-dashboard/api/queries";
import { getAdminStores } from "@/features/stores/api/queries";
import { adminConfig, getSectionTabs } from "./config.shared";
import { allDomainNavItems } from "./nav";
import type { AdminServerBindings, CounterKey } from "./types";

async function getPendingCommentsCount(): Promise<number> {
  "use cache";
  cacheLife("minutes");
  cacheTag("comments");

  return await db
    .select({ count: count() })
    .from(postComments)
    .where(eq(postComments.isPublished, false))
    .then((res) => res[0]?.count ?? 0);
}

async function getPendingApplicationsCount(): Promise<number> {
  "use cache";
  cacheLife("minutes");
  cacheTag("b2b-applications");

  return await db
    .select({ count: count() })
    .from(b2bApplications)
    .where(eq(b2bApplications.status, "pending"))
    .then((res) => res[0]?.count ?? 0);
}

/** Counter + list-query bindings for adminConfig. */
export const serverBindings = {
  counters: {
    newOrders: getOrdersCount,
    activeCarts: getCartsCount,
    pendingComments: getPendingCommentsCount,
    pendingApplications: getPendingApplicationsCount,
  },
  queries: {
    "eshop.stores": async (_params) => getAdminStores(),
  },
} satisfies AdminServerBindings;

function collectConfiguredCounterKeys(): CounterKey[] {
  const keys = new Set<CounterKey>();
  for (const domain of Object.values(adminConfig)) {
    for (const section of Object.values(domain.sections)) {
      if (section.badgeKey) {
        keys.add(section.badgeKey);
      }
    }
  }
  return [...keys];
}

/** Resolve only counters referenced by adminConfig sections. */
export async function resolveCounters(): Promise<Record<CounterKey, number>> {
  const keys = collectConfiguredCounterKeys();
  const entries = await Promise.all(
    keys.map(
      async (key) => [key, await serverBindings.counters[key]()] as const
    )
  );
  return Object.fromEntries(entries) as Record<CounterKey, number>;
}

/**
 * href → count for icon rail domains (sum of section counters) and sections.
 * Serializable — safe to pass into the client sidebar.
 */
export async function getNavBadgeCountsByHref(): Promise<
  Record<string, number>
> {
  const counters = await resolveCounters();
  const counts: Record<string, number> = {};

  for (const item of allDomainNavItems) {
    let domainSum = 0;
    for (const sub of item.items ?? []) {
      const n = sub.badgeKey ? (counters[sub.badgeKey] ?? 0) : 0;
      counts[sub.href] = n;
      domainSum += n;
    }
    counts[item.href] = domainSum;
  }

  return counts;
}

/** Section tabs with counter values already applied from serverBindings. */
export async function getSectionTabsWithCounts(domainSlug: string) {
  const counters = await resolveCounters();
  return getSectionTabs(domainSlug).map((tab) => ({
    href: tab.href as Route,
    label: tab.label,
    badge: tab.badgeKey ? counters[tab.badgeKey] : undefined,
  }));
}
