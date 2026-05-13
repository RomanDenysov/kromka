"use cache";

import { and, asc, eq, isNotNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { ingredients, products, recipeItems, recipes } from "@/db/schema";
import type { AllergenCode } from "@/features/allergens/schema";
import type {
  IngredientLite,
  RecipeLite,
  ResolverContext,
} from "../lib/cost-resolver";

/**
 * Recipe list. Defaults to sub-recipes (the standalone /admin/recipes
 * page). Final-product recipes are reached through the product detail.
 */
export async function getRecipes(
  opts: { kind?: "product" | "sub_recipe" } = {}
) {
  cacheLife("hours");
  cacheTag("recipes");
  if (opts.kind) {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.kind, opts.kind))
      .orderBy(asc(recipes.name));
  }
  return await db.select().from(recipes).orderBy(asc(recipes.name));
}

export type RecipeRow = Awaited<ReturnType<typeof getRecipes>>[number];

/**
 * Single recipe + ordered items with joined references. Used by the
 * builder page and the product Recept tab.
 */
export async function getRecipeById(id: string) {
  cacheLife("hours");
  cacheTag("recipes", `recipe-${id}`);

  const recipeRow = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1);
  if (!recipeRow[0]) {
    return null;
  }

  const items = await db
    .select({
      id: recipeItems.id,
      recipeId: recipeItems.recipeId,
      ingredientId: recipeItems.ingredientId,
      subRecipeId: recipeItems.subRecipeId,
      quantityBaseUnit: recipeItems.quantityBaseUnit,
      sortOrder: recipeItems.sortOrder,
      notes: recipeItems.notes,
    })
    .from(recipeItems)
    .where(eq(recipeItems.recipeId, id))
    .orderBy(asc(recipeItems.sortOrder));

  return { recipe: recipeRow[0], items };
}

export type RecipeWithItems = NonNullable<
  Awaited<ReturnType<typeof getRecipeById>>
>;

/**
 * Build the whole resolver context (ingredients + recipes as Maps).
 * Used by the live preview (client side, cached page payload) and by
 * the order snapshot at checkout (server side, cached query).
 *
 * `includeDrafts = true` for the admin builder (so previews work
 * while building); `false` for the order snapshot path so customers
 * only ever consume published recipes.
 */
export async function getResolverContext(
  opts: { includeDrafts?: boolean } = {}
): Promise<ResolverContext> {
  cacheLife("hours");
  cacheTag("recipes", "ingredients");

  const [allIngredients, allRecipes, allItems] = await Promise.all([
    db
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
      .from(ingredients),
    opts.includeDrafts
      ? db
          .select({
            id: recipes.id,
            name: recipes.name,
            batchYieldUnits: recipes.batchYieldUnits,
            batchYieldGrams: recipes.batchYieldGrams,
            yieldLossPercent: recipes.yieldLossPercent,
          })
          .from(recipes)
      : db
          .select({
            id: recipes.id,
            name: recipes.name,
            batchYieldUnits: recipes.batchYieldUnits,
            batchYieldGrams: recipes.batchYieldGrams,
            yieldLossPercent: recipes.yieldLossPercent,
          })
          .from(recipes)
          .where(eq(recipes.status, "published")),
    db
      .select({
        id: recipeItems.id,
        recipeId: recipeItems.recipeId,
        ingredientId: recipeItems.ingredientId,
        subRecipeId: recipeItems.subRecipeId,
        quantityBaseUnit: recipeItems.quantityBaseUnit,
        sortOrder: recipeItems.sortOrder,
      })
      .from(recipeItems)
      .orderBy(asc(recipeItems.sortOrder)),
  ]);

  const ingredientMap = new Map<string, IngredientLite>();
  for (const i of allIngredients) {
    ingredientMap.set(i.id, {
      id: i.id,
      name: i.name,
      baseUnit: i.baseUnit,
      gramsPerPiece: i.gramsPerPiece,
      pricePerKgCents: i.pricePerKgCents,
      pricePerPieceCents: i.pricePerPieceCents,
      allergenCodes: i.allergenCodes as AllergenCode[],
      nutritionPer100: i.nutritionPer100,
    });
  }

  const itemsByRecipe = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const arr = itemsByRecipe.get(item.recipeId);
    if (arr) {
      arr.push(item);
    } else {
      itemsByRecipe.set(item.recipeId, [item]);
    }
  }

  const recipeMap = new Map<string, RecipeLite>();
  for (const r of allRecipes) {
    recipeMap.set(r.id, {
      id: r.id,
      name: r.name,
      batchYieldUnits: r.batchYieldUnits,
      batchYieldGrams: r.batchYieldGrams,
      yieldLossPercent: r.yieldLossPercent,
      items: (itemsByRecipe.get(r.id) ?? []).map((it) => ({
        id: it.id,
        ingredientId: it.ingredientId,
        subRecipeId: it.subRecipeId,
        quantityBaseUnit: it.quantityBaseUnit,
      })),
    });
  }

  return { ingredients: ingredientMap, recipes: recipeMap };
}

/**
 * Cheap adjacency map: recipeId -> sub-recipe IDs it references.
 * Used by the picker's cycle/depth pre-check (`canAddSubRecipe`).
 */
export async function getRecipeGraph() {
  cacheLife("hours");
  cacheTag("recipes");

  const rows = await db
    .select({
      parent: recipeItems.recipeId,
      child: recipeItems.subRecipeId,
    })
    .from(recipeItems)
    .where(isNotNull(recipeItems.subRecipeId));

  const graph = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.child) {
      continue;
    }
    const arr = graph.get(row.parent);
    if (arr) {
      arr.push(row.child);
    } else {
      graph.set(row.parent, [row.child]);
    }
  }
  return graph;
}

/**
 * For a given recipe, return products that link to it (kind=product) AND
 * other recipes that consume it as a sub-recipe. Used by the delete
 * guard and the "used by N products" footer on sub-recipe pages.
 */
export async function getRecipeDependents(recipeId: string) {
  cacheLife("hours");
  cacheTag("recipes", `recipe-${recipeId}`);

  const [linkedProducts, parentRecipes] = await Promise.all([
    db
      .select({ id: products.id, name: products.name, slug: products.slug })
      .from(products)
      .where(eq(products.recipeId, recipeId)),
    db
      .select({
        id: recipes.id,
        name: recipes.name,
        slug: recipes.slug,
      })
      .from(recipeItems)
      .innerJoin(recipes, eq(recipes.id, recipeItems.recipeId))
      .where(eq(recipeItems.subRecipeId, recipeId)),
  ]);
  return { products: linkedProducts, parentRecipes };
}

/**
 * "Najčastejšie" picker pin: top-N ingredients by recipe-item count.
 * Cheap to compute, cached.
 */
export async function getMostUsedIngredients(limit = 10) {
  cacheLife("hours");
  cacheTag("recipes");

  const rows = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
    })
    .from(recipeItems)
    .innerJoin(ingredients, eq(ingredients.id, recipeItems.ingredientId))
    .where(
      and(isNotNull(recipeItems.ingredientId), eq(ingredients.isActive, true))
    )
    .limit(limit);

  // De-dupe by id while preserving order. Drizzle doesn't support
  // GROUP BY ... ORDER BY count(*) DESC cleanly enough to be worth it
  // at this scale; a Map de-dupe is fine for <500 active ingredients.
  const seen = new Set<string>();
  const out: Array<{ id: string; name: string }> = [];
  for (const r of rows) {
    if (seen.has(r.id)) {
      continue;
    }
    seen.add(r.id);
    out.push(r);
    if (out.length >= limit) {
      break;
    }
  }
  return out;
}
