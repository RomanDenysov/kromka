/**
 * Pure-function cost resolver. Single source of truth for cost +
 * (Phase D) nutrition + allergen derivation from a recipe.
 *
 * Used by:
 * - Server actions (authoritative compute on save and at order creation)
 * - Client preview panel (instant feedback during edit)
 *
 * Pricing model: cents/kg (mass) or cents/piece (piece). See
 * docs/specs/_arc-overview.md §3.
 *
 * NEVER throws for missing/zero prices — those degrade to zero
 * contribution + a flag in the trace. Only throws for cycle, depth
 * exceeded, or genuinely missing references.
 */

import type { AllergenCode } from "@/features/allergens/schema";

export const MAX_RECIPE_DEPTH = 3;

export interface IngredientLite {
  allergenCodes: readonly AllergenCode[];
  baseUnit: "g" | "piece";
  gramsPerPiece: number | null;
  id: string;
  name: string;
  pricePerKgCents: number | null;
  pricePerPieceCents: number | null;
}

export interface RecipeLite {
  batchYieldGrams: number;
  batchYieldUnits: number;
  id: string;
  items: readonly RecipeItemLite[];
  name: string;
  yieldLossPercent: number;
}

export interface RecipeItemLite {
  id?: string;
  ingredientId: string | null;
  quantityBaseUnit: number;
  subRecipeId: string | null;
}

export interface ResolverContext {
  ingredients: ReadonlyMap<string, IngredientLite>;
  recipes: ReadonlyMap<string, RecipeLite>;
}

export interface ResolvedRecipeItem {
  allergenCodes: readonly AllergenCode[];
  /** False when the ingredient/sub-recipe has no usable price. */
  hasPrice: boolean;
  itemId?: string;
  kind: "ingredient" | "sub_recipe";
  /** Mass contribution in grams (used by Phase D for nutrition math). */
  massGrams: number;
  quantityBaseUnit: number;
  refId: string;
  refName: string;
  /** Total cost contribution to the parent batch, in cents. */
  totalCostCents: number;
  /** Unit cost in cents (per kg or per piece for ingredients, per gram for sub-recipes). */
  unitCostCents: number;
}

export interface ResolvedRecipe {
  allergenCodes: AllergenCode[];
  batchCostCents: number;
  costPerUnitCents: number;
  finishedMassGrams: number;
  recipeId: string;
  trace: ResolvedRecipeItem[];
}

export class RecipeCycleError extends Error {
  readonly recipeId: string;
  readonly path: string[];
  constructor(recipeId: string, path: string[]) {
    super(`Recipe ${recipeId} forms a cycle through [${path.join(" -> ")}]`);
    this.name = "RecipeCycleError";
    this.recipeId = recipeId;
    this.path = path;
  }
}

export class RecipeDepthError extends Error {
  readonly recipeId: string;
  constructor(recipeId: string) {
    super(
      `Recipe ${recipeId} exceeds the max recipe depth of ${MAX_RECIPE_DEPTH}`
    );
    this.name = "RecipeDepthError";
    this.recipeId = recipeId;
  }
}

export class RecipeNotFoundError extends Error {
  readonly recipeId: string;
  constructor(recipeId: string) {
    super(`Recipe ${recipeId} not found in resolver context`);
    this.name = "RecipeNotFoundError";
    this.recipeId = recipeId;
  }
}

export class IngredientNotFoundError extends Error {
  readonly ingredientId: string;
  constructor(ingredientId: string) {
    super(`Ingredient ${ingredientId} not found in resolver context`);
    this.name = "IngredientNotFoundError";
    this.ingredientId = ingredientId;
  }
}

/**
 * Compute cost + allergens for the recipe. Recurses through sub-recipes
 * with cycle + depth guards.
 *
 * @throws RecipeCycleError when a cycle is detected
 * @throws RecipeDepthError when MAX_RECIPE_DEPTH is exceeded
 * @throws RecipeNotFoundError / IngredientNotFoundError for dangling refs
 */
export function resolveRecipeCost(
  recipeId: string,
  ctx: ResolverContext,
  visited: ReadonlySet<string> = new Set()
): ResolvedRecipe {
  if (visited.has(recipeId)) {
    throw new RecipeCycleError(recipeId, [...visited]);
  }
  if (visited.size >= MAX_RECIPE_DEPTH) {
    throw new RecipeDepthError(recipeId);
  }

  const recipe = ctx.recipes.get(recipeId);
  if (!recipe) {
    throw new RecipeNotFoundError(recipeId);
  }

  const nextVisited = new Set(visited);
  nextVisited.add(recipeId);

  let batchCostCents = 0;
  const allergens = new Set<AllergenCode>();
  const trace: ResolvedRecipeItem[] = [];

  for (const item of recipe.items) {
    const resolved = resolveOneItem(item, ctx, nextVisited);
    if (resolved) {
      trace.push(resolved);
      batchCostCents += resolved.totalCostCents;
      for (const c of resolved.allergenCodes) {
        allergens.add(c);
      }
    }
  }

  const finishedMassGrams = Math.round(
    recipe.batchYieldGrams * (1 - recipe.yieldLossPercent / 100)
  );
  const costPerUnitCents = Math.round(
    batchCostCents / Math.max(recipe.batchYieldUnits, 1)
  );

  return {
    recipeId,
    batchCostCents,
    costPerUnitCents,
    allergenCodes: [...allergens].sort(),
    finishedMassGrams,
    trace,
  };
}

function resolveOneItem(
  item: RecipeItemLite,
  ctx: ResolverContext,
  visited: ReadonlySet<string>
): ResolvedRecipeItem | null {
  if (item.ingredientId) {
    const ing = ctx.ingredients.get(item.ingredientId);
    if (!ing) {
      throw new IngredientNotFoundError(item.ingredientId);
    }
    return resolveIngredientItem(ing, item);
  }
  if (item.subRecipeId) {
    const sub = resolveRecipeCost(item.subRecipeId, ctx, visited);
    return resolveSubRecipeItem(sub, item);
  }
  return null;
}

function resolveIngredientItem(
  ing: IngredientLite,
  item: RecipeItemLite
): ResolvedRecipeItem {
  let totalCostCents = 0;
  let unitCostCents = 0;
  let hasPrice = false;
  let massGrams = 0;

  if (ing.baseUnit === "g") {
    massGrams = item.quantityBaseUnit;
    if (ing.pricePerKgCents !== null && ing.pricePerKgCents > 0) {
      unitCostCents = ing.pricePerKgCents;
      totalCostCents = Math.round(
        (item.quantityBaseUnit * ing.pricePerKgCents) / 1000
      );
      hasPrice = true;
    }
  } else {
    // piece-based
    massGrams = item.quantityBaseUnit * (ing.gramsPerPiece ?? 0);
    if (ing.pricePerPieceCents !== null && ing.pricePerPieceCents > 0) {
      unitCostCents = ing.pricePerPieceCents;
      totalCostCents = item.quantityBaseUnit * ing.pricePerPieceCents;
      hasPrice = true;
    }
  }

  return {
    itemId: item.id,
    kind: "ingredient",
    refId: ing.id,
    refName: ing.name,
    quantityBaseUnit: item.quantityBaseUnit,
    unitCostCents,
    totalCostCents,
    allergenCodes: ing.allergenCodes,
    hasPrice,
    massGrams,
  };
}

function resolveSubRecipeItem(
  sub: ResolvedRecipe,
  item: RecipeItemLite
): ResolvedRecipeItem {
  // Sub-recipes are consumed by mass (grams).
  const massGrams = item.quantityBaseUnit;
  let unitCostCents = 0;
  let totalCostCents = 0;
  let hasPrice = false;

  if (sub.finishedMassGrams > 0 && sub.batchCostCents > 0) {
    // Per-gram cost of the sub-recipe times the quantity used.
    const subPerGramHundredths =
      (sub.batchCostCents * 100) / sub.finishedMassGrams;
    unitCostCents = Math.round(subPerGramHundredths / 100);
    totalCostCents = Math.round((subPerGramHundredths * massGrams) / 100);
    hasPrice = true;
  }

  return {
    itemId: item.id,
    kind: "sub_recipe",
    refId: sub.recipeId,
    refName: "",
    quantityBaseUnit: item.quantityBaseUnit,
    unitCostCents,
    totalCostCents,
    allergenCodes: sub.allergenCodes,
    hasPrice,
    massGrams,
  };
}

/**
 * Cycle/depth pre-check used by the picker to filter out invalid
 * sub-recipe choices BEFORE the resolver runs. Returns ok:false with a
 * reason that the UI can render directly.
 */
export type CanAddResult =
  | { ok: true }
  | { ok: false; reason: "self" | "cycle" | "depth" };

export function canAddSubRecipe(
  hostRecipeId: string,
  candidateSubRecipeId: string,
  recipesGraph: ReadonlyMap<string, readonly string[]>,
  currentDepth = 0
): CanAddResult {
  if (hostRecipeId === candidateSubRecipeId) {
    return { ok: false, reason: "self" };
  }

  if (currentDepth >= MAX_RECIPE_DEPTH) {
    return { ok: false, reason: "depth" };
  }

  // Walk the candidate's tree; if we ever see the host, that's a cycle.
  const stack: Array<{ id: string; d: number }> = [
    { id: candidateSubRecipeId, d: currentDepth + 1 },
  ];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const top = stack.pop();
    if (!top) {
      break;
    }
    const { id, d } = top;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    if (id === hostRecipeId) {
      return { ok: false, reason: "cycle" };
    }
    if (d >= MAX_RECIPE_DEPTH) {
      return { ok: false, reason: "depth" };
    }
    const children = recipesGraph.get(id) ?? [];
    for (const child of children) {
      stack.push({ id: child, d: d + 1 });
    }
  }

  return { ok: true };
}
