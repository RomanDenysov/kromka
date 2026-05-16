"use cache";

import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { ingredientPriceHistory, ingredients } from "@/db/schema";

interface ListOpts {
  isActive?: boolean;
  missingNutrition?: boolean;
  missingPrice?: boolean;
  search?: string;
}

/**
 * Admin ingredient list. Search uses trigram similarity over
 * lower(f_unaccent(name)), so "muka" matches "Hladká múka T650".
 */
export async function getIngredients(opts: ListOpts = {}) {
  cacheLife("hours");
  cacheTag("ingredients");

  const filters = [] as ReturnType<typeof eq>[];
  if (typeof opts.isActive === "boolean") {
    filters.push(eq(ingredients.isActive, opts.isActive));
  }
  if (opts.missingPrice) {
    const missing = or(
      eq(ingredients.pricePerKgCents, 0),
      eq(ingredients.pricePerPieceCents, 0)
    );
    if (missing) {
      filters.push(missing);
    }
  }
  if (opts.missingNutrition) {
    filters.push(isNull(ingredients.nutritionPer100));
  }

  if (opts.search && opts.search.length > 0) {
    const term = opts.search;
    // pg_trgm threshold 0.3 keeps results loose enough for typos
    filters.push(
      sql`similarity(lower(f_unaccent(${ingredients.name})), lower(f_unaccent(${term}))) > 0.3
       OR lower(f_unaccent(${ingredients.name})) ILIKE '%' || lower(f_unaccent(${term})) || '%'`
    );
  }

  return await db
    .select()
    .from(ingredients)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(ingredients.name))
    .limit(500);
}

export type IngredientListRow = Awaited<
  ReturnType<typeof getIngredients>
>[number];

export async function getIngredientById(id: string) {
  cacheLife("hours");
  cacheTag("ingredients", `ingredient-${id}`);

  const row = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.id, id))
    .limit(1);
  return row[0] ?? null;
}

export type Ingredient = NonNullable<
  Awaited<ReturnType<typeof getIngredientById>>
>;

export async function getIngredientPriceHistory(id: string, limit = 50) {
  cacheLife("hours");
  cacheTag(`ingredient-${id}-prices`);

  return await db
    .select()
    .from(ingredientPriceHistory)
    .where(eq(ingredientPriceHistory.ingredientId, id))
    .orderBy(desc(ingredientPriceHistory.effectiveFrom))
    .limit(limit);
}

/**
 * Lightweight catalog used by Phase C's resolver context. Returns only
 * the columns the resolver needs, filtered to active ingredients.
 */
export async function getIngredientsForResolver() {
  cacheLife("hours");
  cacheTag("ingredients");

  return await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      baseUnit: ingredients.baseUnit,
      gramsPerPiece: ingredients.gramsPerPiece,
      pricePerKgCents: ingredients.pricePerKgCents,
      pricePerPieceCents: ingredients.pricePerPieceCents,
      allergenCodes: ingredients.allergenCodes,
      nutritionPer100: ingredients.nutritionPer100,
    })
    .from(ingredients)
    .where(eq(ingredients.isActive, true));
}

export type IngredientForResolver = Awaited<
  ReturnType<typeof getIngredientsForResolver>
>[number];

/**
 * Trigram similarity lookup used by the duplicate-suggestion UI when
 * the admin types a new ingredient name.
 */
export async function findSimilarIngredients(name: string, limit = 5) {
  cacheLife("hours");
  cacheTag("ingredients");

  if (!name || name.trim().length === 0) {
    return [];
  }

  const rows = await db.execute(sql`
    SELECT id, name,
      similarity(lower(f_unaccent(name)), lower(f_unaccent(${name}))) AS score
    FROM ingredients
    WHERE similarity(lower(f_unaccent(name)), lower(f_unaccent(${name}))) > 0.6
    ORDER BY score DESC
    LIMIT ${limit}
  `);
  return rows.rows as Array<{ id: string; name: string; score: number }>;
}

/**
 * Pairs of near-duplicate ingredients above a threshold. Used by the
 * /admin/ingredients/duplicates review page. Read-only diagnostic.
 */
export async function getIngredientDuplicates(threshold = 0.7) {
  cacheLife("hours");
  cacheTag("ingredients");

  const rows = await db.execute(sql`
    SELECT a.id AS a_id, a.name AS a_name, b.id AS b_id, b.name AS b_name,
      similarity(lower(f_unaccent(a.name)), lower(f_unaccent(b.name))) AS score
    FROM ingredients a
    JOIN ingredients b
      ON a.id < b.id
     AND similarity(lower(f_unaccent(a.name)), lower(f_unaccent(b.name))) > ${threshold}
    ORDER BY score DESC
    LIMIT 100
  `);
  return rows.rows as Array<{
    a_id: string;
    a_name: string;
    b_id: string;
    b_name: string;
    score: number;
  }>;
}
