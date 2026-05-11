import { and, count, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { orders, stores } from "@/db/schema";

export const getStoreBySlug = cache(async (slug: string) => {
  "use cache";
  cacheLife("max");
  cacheTag("stores", `store-${slug}`);
  return await db.query.stores.findFirst({
    where: and(eq(stores.slug, slug), eq(stores.isActive, true)),
  });
});

/**
 * Get all active stores accessible by the current manager.
 * TODO: When store_profiles table exists, filter by manager's organizations.
 */
export const getManagerStores = cache(async () => {
  "use cache";
  cacheLife("max");
  cacheTag("stores");
  return await db.query.stores.findMany({
    where: eq(stores.isActive, true),
    orderBy: (s, { asc }) => asc(s.name),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });
});

export const getStorePendingPickupsCount = cache(async (storeId: string) => {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders", `store-pending-${storeId}`);
  const [result] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        eq(orders.storeId, storeId),
        inArray(orders.orderStatus, ["new", "in_progress", "ready_for_pickup"])
      )
    );

  return result?.count ?? 0;
});

export type ManagerStore = Awaited<ReturnType<typeof getManagerStores>>[number];
