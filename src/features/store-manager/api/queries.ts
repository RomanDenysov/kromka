import { and, count, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { orders, stores } from "@/db/schema";

/**
 * Resolve a store by slug for the manager UI.
 * TODO(phase-4): production blocker — currently any staff user can open
 * any store by slug. When `store_profiles` lands, gate by the caller's
 * store assignments (return null + trigger notFound for unauthorized).
 */
export const getStoreBySlug = cache(async (slug: string) => {
  "use cache";
  cacheLife("max");
  cacheTag("stores", `store-${slug}`);
  const result = await db.query.stores.findFirst({
    where: and(eq(stores.slug, slug), eq(stores.isActive, true)),
  });
  return result;
});

/**
 * Stores listed in the manager picker.
 * TODO(phase-4): production blocker — currently returns ALL active stores
 * to every staff user. When `store_profiles` lands, filter by the caller's
 * assignments. Until then, do NOT enable `manager` role in production.
 */
export const getManagerStores = cache(async () => {
  "use cache";
  cacheLife("max");
  cacheTag("stores");
  const result = await db.query.stores.findMany({
    where: eq(stores.isActive, true),
    orderBy: (s, { asc }) => asc(s.name),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });
  return result;
});

export const getStorePendingPickupsCount = cache(async (storeId: string) => {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders", `store-pending-${storeId}`);
  const result = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        eq(orders.storeId, storeId),
        inArray(orders.orderStatus, ["new", "in_progress", "ready_for_pickup"])
      )
    );

  return result[0]?.count ?? 0;
});

export type ManagerStore = Awaited<ReturnType<typeof getManagerStores>>[number];
