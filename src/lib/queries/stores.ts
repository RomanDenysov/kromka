import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";

export async function getStores() {
  return await db.query.stores.findMany({
    where: eq(stores.isActive, true),
    orderBy: desc(stores.createdAt),
    with: {
      image: true,
      users: true,
      orders: true,
    },
  });
}

export type Store = Awaited<ReturnType<typeof getStores>>[number];
