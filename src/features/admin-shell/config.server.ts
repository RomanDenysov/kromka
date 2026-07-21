import "server-only";

import { count, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { b2bApplications, postComments } from "@/db/schema";
import {
  getCartsCount,
  getOrdersCount,
} from "@/features/admin-dashboard/api/queries";
import type { AdminSidebarBadges } from "@/features/admin-sidebar/badge-types";
import type { AdminServerBindings } from "./types";

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

/** Counter bindings keyed by section `badgeKey` values in adminConfig. */
export const serverBindings = {
  counters: {
    newOrders: getOrdersCount,
    activeCarts: getCartsCount,
    pendingComments: getPendingCommentsCount,
    pendingApplications: getPendingApplicationsCount,
  },
} satisfies AdminServerBindings;

/** Resolve all configured badge counters. Invalidated via orders, comments, b2b-applications, carts tags. */
export async function resolveAdminBadges(): Promise<AdminSidebarBadges> {
  const [newOrders, activeCarts, pendingComments, pendingApplications] =
    await Promise.all([
      serverBindings.counters.newOrders(),
      serverBindings.counters.activeCarts(),
      serverBindings.counters.pendingComments(),
      serverBindings.counters.pendingApplications(),
    ]);

  return {
    newOrders,
    activeCarts,
    pendingComments,
    pendingApplications,
  };
}
