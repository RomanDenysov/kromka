import { and, count, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { orders, stores } from "@/db/schema";

export const getStoreBySlug = cache((slug: string) => {
  return db.query.stores.findFirst({
    where: eq(stores.slug, slug),
    with: {
      image: {
        columns: {
          url: true,
        },
      },
    },
  });
});

/**
 * Get all active stores accessible by the current manager.
 * TODO: When store_profiles table exists, filter by manager's organizations.
 */
export const getManagerStores = cache(() => {
  return db.query.stores.findMany({
    where: eq(stores.isActive, true),
    orderBy: (s, { asc }) => asc(s.name),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });
});

export async function getStorePendingPickupsCount(storeId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(orders)
    .where(and(eq(orders.storeId, storeId), eq(orders.orderStatus, "new")));

  return result?.count ?? 0;
}

export type ManagerStore = Awaited<ReturnType<typeof getManagerStores>>[number];
