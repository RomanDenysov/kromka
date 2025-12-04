import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { stores } from "@/db/schema";

export const getStores = cache(
  async () =>
    await db.query.stores.findMany({
      where: eq(stores.isActive, true),
      orderBy: desc(stores.createdAt),
    })
);

export type Store = Awaited<ReturnType<typeof getStores>>[number];
