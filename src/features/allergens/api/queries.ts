"use cache";

import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { allergens } from "@/db/schema";

/**
 * The 14 EU allergens, ordered by the canonical sortOrder.
 *
 * Cached with cacheLife("max") because the seed never changes after
 * Phase A migration. If a future localization phase adds rows, invalidate
 * the "allergens" tag manually.
 */
export async function getAllergens() {
  cacheLife("max");
  cacheTag("allergens");
  return await db.select().from(allergens).orderBy(asc(allergens.sortOrder));
}

export type Allergen = Awaited<ReturnType<typeof getAllergens>>[number];
