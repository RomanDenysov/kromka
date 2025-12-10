import { asc, desc, eq } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { stores } from "@/db/schema";

export const getStores = cache(async () => {
  "use cache";
  cacheLife("hours");
  return await db.query.stores.findMany({
    where: eq(stores.isActive, true),
    orderBy: desc(stores.createdAt),
    with: {
      image: {
        columns: {
          url: true,
        },
      },
    },
  });
});

export function getAdminStores() {
  return db.query.stores.findMany({
    with: {
      image: {
        columns: {
          id: true,
          url: true,
        },
      },
      orders: {
        columns: {
          id: true,
        },
      },
      users: {
        columns: {
          id: true,
        },
      },
    },
    orderBy: asc(stores.name),
  });
}

export function getAdminStoreById(id: string) {
  return db.query.stores.findFirst({
    where: eq(stores.id, id),
    with: {
      image: {
        columns: {
          id: true,
          url: true,
        },
      },
      orders: {
        columns: {
          id: true,
        },
      },
      users: {
        columns: {
          id: true,
        },
      },
    },
  });
}

export type Store = Awaited<ReturnType<typeof getStores>>[number];
export type AdminStore = Awaited<ReturnType<typeof getAdminStores>>[number];
export type AdminStoreById = Awaited<ReturnType<typeof getAdminStoreById>>;
