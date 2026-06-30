import { and, asc, count, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { orders, storeManagerAssignments, stores } from "@/db/schema";
import type { UserRole } from "@/db/types";

interface StaffUser {
  id: string;
  role: UserRole;
}

export interface ManagerStore {
  id: string;
  name: string;
  slug: string;
}

const managerStoreSelect = {
  id: stores.id,
  name: stores.name,
  slug: stores.slug,
};

/**
 * Resolve a store by slug for the manager UI.
 * Admins can open any active store; managers are limited to assignments.
 */
const getActiveStoreBySlug = cache(async (slug: string) => {
  "use cache";
  cacheLife("max");
  cacheTag("stores", `store-${slug}`);
  const result = await db.query.stores.findFirst({
    where: and(eq(stores.slug, slug), eq(stores.isActive, true)),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });
  return result;
});

/**
 * Stores listed in the manager picker.
 * Admins see every active store; managers see only assigned active stores.
 */
const getAllActiveManagerStores = cache(async (): Promise<ManagerStore[]> => {
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

export const getAssignedManagerStores = cache(
  async (userId: string): Promise<ManagerStore[]> => {
    const result = await db
      .select(managerStoreSelect)
      .from(stores)
      .innerJoin(
        storeManagerAssignments,
        eq(storeManagerAssignments.storeId, stores.id)
      )
      .where(
        and(
          eq(storeManagerAssignments.userId, userId),
          eq(stores.isActive, true)
        )
      )
      .orderBy(asc(stores.name));

    return result;
  }
);

export const getManagerStores = cache((user: StaffUser) => {
  if (user.role === "admin") {
    return getAllActiveManagerStores();
  }

  return getAssignedManagerStores(user.id);
});

export const getStoreBySlug = cache(
  async (user: StaffUser, slug: string): Promise<ManagerStore | null> => {
    if (user.role === "admin") {
      return (await getActiveStoreBySlug(slug)) ?? null;
    }

    const result = await db
      .select(managerStoreSelect)
      .from(stores)
      .innerJoin(
        storeManagerAssignments,
        eq(storeManagerAssignments.storeId, stores.id)
      )
      .where(
        and(
          eq(storeManagerAssignments.userId, user.id),
          eq(stores.slug, slug),
          eq(stores.isActive, true)
        )
      )
      .limit(1);

    return result[0] ?? null;
  }
);

export async function canManageStore(
  user: StaffUser,
  storeId: string | null | undefined
): Promise<boolean> {
  if (!storeId) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const managedStore = await db
    .select({ id: stores.id })
    .from(stores)
    .innerJoin(
      storeManagerAssignments,
      eq(storeManagerAssignments.storeId, stores.id)
    )
    .where(
      and(
        eq(stores.id, storeId),
        eq(stores.isActive, true),
        eq(storeManagerAssignments.userId, user.id)
      )
    )
    .limit(1);

  return managedStore.length > 0;
}

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
