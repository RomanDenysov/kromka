import "server-only";

import { isNotNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { AllergenCode } from "@/features/allergens/schema";
import { getResolverContext } from "@/features/recipes/api/queries";
import { resolveRecipeCost } from "@/features/recipes/lib/cost-resolver";
import { log } from "@/lib/logger";

export interface DriftRow {
  added: AllergenCode[];
  derivedCodes: AllergenCode[];
  manualCodes: AllergenCode[];
  productId: string;
  productName: string;
  productSlug: string;
  recipeId: string;
  removed: AllergenCode[];
  resolverError: string | null;
}

interface DriftResult {
  items: DriftRow[];
  total: number;
}

/**
 * Diff between manual products.allergenCodes and recipe-derived allergens
 * for products with a linked recipe. Paginated to stay fast on growing
 * catalogs. Read-only diagnostic.
 */
export async function getAllergenDrift(
  opts: { offset?: number; limit?: number } = {}
): Promise<DriftResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "recipes", "ingredients", "allergens-drift");

  const offset = opts.offset ?? 0;
  const limit = Math.min(opts.limit ?? 50, 100);

  const [page, ctx] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        recipeId: products.recipeId,
        allergenCodes: products.allergenCodes,
      })
      .from(products)
      .where(isNotNull(products.recipeId))
      .limit(limit)
      .offset(offset),
    getResolverContext({ includeDrafts: false }),
  ]);

  const totalRow = await db
    .select({ count: products.id })
    .from(products)
    .where(isNotNull(products.recipeId));
  const total = totalRow.length;

  const items: DriftRow[] = [];
  for (const p of page) {
    if (!p.recipeId) {
      continue;
    }
    const manual = (p.allergenCodes as AllergenCode[]).slice().sort();
    let derived: AllergenCode[] = [];
    let resolverError: string | null = null;
    try {
      const resolved = resolveRecipeCost(p.recipeId, ctx);
      derived = resolved.allergenCodes.slice().sort();
    } catch (err) {
      log.products.warn(
        { err, productId: p.id, recipeId: p.recipeId },
        "Allergen drift resolver failed"
      );
      resolverError = err instanceof Error ? err.message : "Unknown error";
    }

    const manualSet = new Set(manual);
    const derivedSet = new Set(derived);
    const added = derived.filter((c) => !manualSet.has(c));
    const removed = manual.filter((c) => !derivedSet.has(c));

    if (added.length + removed.length > 0 || resolverError) {
      items.push({
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        recipeId: p.recipeId,
        manualCodes: manual,
        derivedCodes: derived,
        added,
        removed,
        resolverError,
      });
    }
  }

  return { items, total };
}
