import "server-only";

import { count, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { b2bApplications, postComments } from "@/db/schema";
import {
  getCartsCount,
  getOrdersCount,
} from "@/features/admin-dashboard/api/queries";

export interface AdminSidebarBadges {
  activeCarts: number;
  newOrders: number;
  pendingApplications: number;
  pendingComments: number;
}

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

/** Counts for admin sidebar badges. Invalidated via orders, comments, b2b-applications, carts tags. */
export async function getAdminSidebarBadges(): Promise<AdminSidebarBadges> {
  const [newOrders, pendingComments, pendingApplications, activeCarts] =
    await Promise.all([
      getOrdersCount(),
      getPendingCommentsCount(),
      getPendingApplicationsCount(),
      getCartsCount(),
    ]);

  return {
    newOrders,
    pendingComments,
    pendingApplications,
    activeCarts,
  };
}
