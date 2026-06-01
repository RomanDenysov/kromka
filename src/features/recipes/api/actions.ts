"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { products, recipeItems, recipes } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import { requireRecipeEdit } from "@/lib/auth/guards";
import { log } from "@/lib/logger";
import { canAddSubRecipe, resolveRecipeCost } from "../lib/cost-resolver";
import {
  type AddRecipeItemSchema,
  addRecipeItemSchema,
  type LinkProductRecipeSchema,
  linkProductRecipeSchema,
  type RecipeHeaderSchema,
  recipeHeaderSchema,
  removeRecipeItemSchema,
  reorderRecipeItemsSchema,
  type UpdateRecipeItemSchema,
  updateRecipeItemSchema,
} from "../schema";
import {
  getRecipeDependents,
  getRecipeGraph,
  getResolverContext,
} from "./queries";

type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true } & T)
  | { success: false; error: string };

function invalidate(recipeId?: string, productId?: string) {
  updateTag("recipes");
  updateTag("products");
  updateTag("reports");
  if (recipeId) {
    updateTag(`recipe-${recipeId}`);
  }
  if (productId) {
    updateTag(`product-${productId}`);
  }
}

// ---------------- Recipe header CRUD ----------------

/**
 * Create a draft recipe + redirect to its edit page.
 * Used by the "Nový recept" button on /admin/recipes and by the
 * "Vytvoriť recept" CTA inside the product Recept tab.
 */
export async function createRecipeAction({
  kind,
  productId,
}: {
  kind?: "product" | "sub_recipe";
  productId?: string | null;
}) {
  await requireRecipeEdit();

  const [created] = await db
    .insert(recipes)
    .values({ kind: kind ?? "product" })
    .returning({ id: recipes.id });

  // Optionally link to a product (e.g. when called from the product page).
  // A link failure must not lose the freshly created recipe — log and continue
  // so the user still lands on the editable recipe.
  if (productId) {
    try {
      await db
        .update(products)
        .set({ recipeId: created.id })
        .where(eq(products.id, productId));
    } catch (err) {
      log.recipes.warn(
        { err, recipeId: created.id, productId },
        "Failed to link product to new recipe"
      );
    }
  }

  invalidate(created.id, productId ?? undefined);
  redirect(`/admin/recipes/${created.id}`);
}

export async function updateRecipeHeaderAction({
  id,
  data,
}: {
  id: string;
  data: RecipeHeaderSchema;
}): Promise<ActionResult> {
  await requireRecipeEdit();
  const parsed = recipeHeaderSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  try {
    // If admin flips kind from product -> sub_recipe, unlink any product
    // that points to this recipe (sub-recipes aren't standalone products).
    if (v.kind === "sub_recipe") {
      await db
        .update(products)
        .set({ recipeId: null })
        .where(eq(products.recipeId, id));
    }
    await db
      .update(recipes)
      .set({
        name: v.name,
        slug: v.slug || draftSlug(v.name),
        kind: v.kind,
        status: v.status,
        batchYieldUnits: v.batchYieldUnits,
        batchYieldGrams: v.batchYieldGrams,
        yieldLossPercent: v.yieldLossPercent,
        notes: v.notes,
      })
      .where(eq(recipes.id, id));
    invalidate(id);
    return { success: true };
  } catch (err) {
    log.recipes.error({ err, recipeId: id }, "Update recipe header failed");
    return { success: false, error: "Uloženie zlyhalo" };
  }
}

export async function deleteRecipeAction({
  id,
}: {
  id: string;
}): Promise<ActionResult> {
  await requireRecipeEdit();

  const deps = await getRecipeDependents(id);
  if (deps.products.length > 0 || deps.parentRecipes.length > 0) {
    return {
      success: false,
      error: `Recept je použitý (${deps.products.length} produktov, ${deps.parentRecipes.length} subreceptov).`,
    };
  }

  try {
    await db.delete(recipes).where(eq(recipes.id, id));
    invalidate(id);
    return { success: true };
  } catch (err) {
    log.recipes.error({ err, recipeId: id }, "Delete recipe failed");
    return { success: false, error: "Odstránenie zlyhalo" };
  }
}

/**
 * Duplicate a recipe into a fresh draft, copy all items. The "5 recipes
 * in and you're reusing" workflow — promoted to MVP per the spike.
 */
export async function duplicateRecipeAction({ id }: { id: string }) {
  await requireRecipeEdit();

  const source = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1);
  if (!source[0]) {
    return { success: false, error: "Recept neexistuje" } as const;
  }
  const src = source[0];

  const items = await db
    .select()
    .from(recipeItems)
    .where(eq(recipeItems.recipeId, id));

  const [copy] = await db
    .insert(recipes)
    .values({
      name: `${src.name} (kópia)`,
      slug: draftSlug(`${src.name} kopia`),
      kind: src.kind,
      status: "draft",
      batchYieldUnits: src.batchYieldUnits,
      batchYieldGrams: src.batchYieldGrams,
      yieldLossPercent: src.yieldLossPercent,
      notes: src.notes,
    })
    .returning({ id: recipes.id });

  if (items.length > 0) {
    await db.insert(recipeItems).values(
      items.map((it) => ({
        recipeId: copy.id,
        ingredientId: it.ingredientId,
        subRecipeId: it.subRecipeId,
        quantityBaseUnit: it.quantityBaseUnit,
        sortOrder: it.sortOrder,
        notes: it.notes,
      }))
    );
  }

  invalidate(copy.id);
  redirect(`/admin/recipes/${copy.id}`);
}

export async function publishRecipeAction({
  id,
}: {
  id: string;
}): Promise<ActionResult> {
  await requireRecipeEdit();

  // Validate the recipe resolves cleanly before allowing publish.
  const ctx = await getResolverContext({ includeDrafts: true });
  try {
    resolveRecipeCost(id, ctx);
  } catch (err) {
    log.recipes.warn(
      { err, recipeId: id },
      "Recipe publish blocked by resolver"
    );
    return {
      success: false,
      error: "Recept nemožno publikovať — chyba pri výpočte nákladov.",
    };
  }

  await db
    .update(recipes)
    .set({ status: "published" })
    .where(eq(recipes.id, id));
  invalidate(id);
  return { success: true };
}

// ---------------- Recipe items ----------------

export async function addRecipeItemAction(
  input: AddRecipeItemSchema
): Promise<ActionResult<{ itemId: string }>> {
  await requireRecipeEdit();
  const parsed = addRecipeItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  // Cycle/depth pre-check for sub-recipes
  if (v.subRecipeId) {
    const graph = await getRecipeGraph();
    const check = canAddSubRecipe(v.recipeId, v.subRecipeId, graph);
    if (!check.ok) {
      return { success: false, error: canAddSubRecipeMessage(check.reason) };
    }
  }

  const max = await db
    .select({ max: sql<number>`COALESCE(MAX(${recipeItems.sortOrder}), -1)` })
    .from(recipeItems)
    .where(eq(recipeItems.recipeId, v.recipeId));
  const sortOrder = (max[0]?.max ?? -1) + 1;

  try {
    const [item] = await db
      .insert(recipeItems)
      .values({
        recipeId: v.recipeId,
        ingredientId: v.ingredientId,
        subRecipeId: v.subRecipeId,
        quantityBaseUnit: v.quantityBaseUnit,
        sortOrder,
      })
      .returning({ id: recipeItems.id });
    invalidate(v.recipeId);
    return { success: true, itemId: item.id };
  } catch (err) {
    log.recipes.error({ err, recipeId: v.recipeId }, "Add recipe item failed");
    return { success: false, error: "Pridanie zlyhalo" };
  }
}

export async function bulkAddItemsFromRecipeAction({
  targetRecipeId,
  sourceRecipeId,
}: {
  targetRecipeId: string;
  sourceRecipeId: string;
}): Promise<ActionResult<{ added: number; skipped: number }>> {
  await requireRecipeEdit();
  if (targetRecipeId === sourceRecipeId) {
    return { success: false, error: "Zdrojový a cieľový recept sú rovnaké" };
  }

  const [sourceItems, existing] = await Promise.all([
    db
      .select()
      .from(recipeItems)
      .where(eq(recipeItems.recipeId, sourceRecipeId))
      .orderBy(recipeItems.sortOrder),
    db
      .select({
        ingredientId: recipeItems.ingredientId,
        subRecipeId: recipeItems.subRecipeId,
      })
      .from(recipeItems)
      .where(eq(recipeItems.recipeId, targetRecipeId)),
  ]);

  const existingIngredients = new Set(
    existing.map((e) => e.ingredientId).filter(Boolean) as string[]
  );
  const existingSubRecipes = new Set(
    existing.map((e) => e.subRecipeId).filter(Boolean) as string[]
  );

  // Cycle/depth check for any sub-recipe items we'd import
  const graph = await getRecipeGraph();

  const maxRow = await db
    .select({ max: sql<number>`COALESCE(MAX(${recipeItems.sortOrder}), -1)` })
    .from(recipeItems)
    .where(eq(recipeItems.recipeId, targetRecipeId));
  let sortOrder = (maxRow[0]?.max ?? -1) + 1;

  const toInsert: Array<{
    recipeId: string;
    ingredientId: string | null;
    subRecipeId: string | null;
    quantityBaseUnit: number;
    sortOrder: number;
  }> = [];
  let skipped = 0;

  for (const it of sourceItems) {
    if (it.ingredientId && existingIngredients.has(it.ingredientId)) {
      skipped++;
      continue;
    }
    if (it.subRecipeId) {
      if (existingSubRecipes.has(it.subRecipeId)) {
        skipped++;
        continue;
      }
      const check = canAddSubRecipe(targetRecipeId, it.subRecipeId, graph);
      if (!check.ok) {
        skipped++;
        continue;
      }
    }
    toInsert.push({
      recipeId: targetRecipeId,
      ingredientId: it.ingredientId,
      subRecipeId: it.subRecipeId,
      quantityBaseUnit: it.quantityBaseUnit,
      sortOrder: sortOrder++,
    });
  }

  if (toInsert.length > 0) {
    try {
      await db.insert(recipeItems).values(toInsert);
    } catch (err) {
      log.recipes.error(
        { err, targetRecipeId, count: toInsert.length },
        "Bulk recipe items insert failed"
      );
      return { success: false, error: "Skupinové pridanie zlyhalo" };
    }
  }
  invalidate(targetRecipeId);
  return { success: true, added: toInsert.length, skipped };
}

export async function updateRecipeItemAction(
  input: UpdateRecipeItemSchema
): Promise<ActionResult> {
  await requireRecipeEdit();
  const parsed = updateRecipeItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  const row = await db
    .select({ recipeId: recipeItems.recipeId })
    .from(recipeItems)
    .where(eq(recipeItems.id, v.itemId))
    .limit(1);
  if (!row[0]) {
    return { success: false, error: "Položka neexistuje" };
  }

  try {
    await db
      .update(recipeItems)
      .set({ quantityBaseUnit: v.quantityBaseUnit })
      .where(eq(recipeItems.id, v.itemId));
    invalidate(row[0].recipeId);
    return { success: true };
  } catch (err) {
    log.recipes.error({ err, itemId: v.itemId }, "Update recipe item failed");
    return { success: false, error: "Uloženie zlyhalo" };
  }
}

export async function removeRecipeItemAction(input: {
  itemId: string;
}): Promise<ActionResult> {
  await requireRecipeEdit();
  const parsed = removeRecipeItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }

  const row = await db
    .select({ recipeId: recipeItems.recipeId })
    .from(recipeItems)
    .where(eq(recipeItems.id, parsed.data.itemId))
    .limit(1);
  if (!row[0]) {
    return { success: true };
  }

  try {
    await db.delete(recipeItems).where(eq(recipeItems.id, parsed.data.itemId));
    invalidate(row[0].recipeId);
    return { success: true };
  } catch (err) {
    log.recipes.error(
      { err, itemId: parsed.data.itemId },
      "Remove recipe item failed"
    );
    return { success: false, error: "Odstránenie zlyhalo" };
  }
}

export async function reorderRecipeItemsAction(input: {
  recipeId: string;
  orderedItemIds: string[];
}): Promise<ActionResult> {
  await requireRecipeEdit();
  const parsed = reorderRecipeItemsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  // Sequential UPDATEs — Neon HTTP doesn't do transactions. Order
  // doesn't matter for correctness (each row's sortOrder is independent).
  try {
    for (let i = 0; i < v.orderedItemIds.length; i++) {
      await db
        .update(recipeItems)
        .set({ sortOrder: i })
        .where(eq(recipeItems.id, v.orderedItemIds[i]));
    }
    invalidate(v.recipeId);
    return { success: true };
  } catch (err) {
    log.recipes.error(
      { err, recipeId: v.recipeId },
      "Reorder recipe items failed"
    );
    return { success: false, error: "Zmena poradia zlyhala" };
  }
}

// ---------------- Product <-> recipe link ----------------

export async function linkProductRecipeAction(
  input: LinkProductRecipeSchema
): Promise<ActionResult> {
  await requireRecipeEdit();
  const parsed = linkProductRecipeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  if (v.recipeId) {
    const target = await db
      .select({ kind: recipes.kind })
      .from(recipes)
      .where(eq(recipes.id, v.recipeId))
      .limit(1);
    if (!target[0]) {
      return { success: false, error: "Recept neexistuje" };
    }
    if (target[0].kind !== "product") {
      return {
        success: false,
        error: 'Iba recepty typu "produkt" je možné priradiť k produktu.',
      };
    }
  }

  try {
    await db
      .update(products)
      .set({ recipeId: v.recipeId })
      .where(eq(products.id, v.productId));
    invalidate(v.recipeId ?? undefined, v.productId);
    return { success: true };
  } catch (err) {
    log.recipes.error(
      { err, productId: v.productId },
      "Link product recipe failed"
    );
    return { success: false, error: "Prepojenie zlyhalo" };
  }
}

function canAddSubRecipeMessage(reason: "self" | "cycle" | "depth"): string {
  if (reason === "cycle") {
    return "Subrecept by vytvoril cyklus.";
  }
  if (reason === "depth") {
    return "Maximálna hĺbka subreceptov je 3.";
  }
  return "Subrecept nemôže odkazovať sám na seba.";
}
