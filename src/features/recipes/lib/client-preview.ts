/**
 * Client-side wrapper around the cost resolver. The recipe builder page
 * loads the full resolver context server-side once, then the live
 * preview panel recomputes locally on every keystroke for instant
 * feedback. Server-authoritative compute on save reconciles.
 */
import type { AllergenCode } from "@/features/allergens/schema";
import {
  type IngredientLite,
  type RecipeItemLite,
  type RecipeLite,
  type ResolvedRecipe,
  type ResolverContext,
  resolveRecipeCost,
} from "./cost-resolver";

export interface ClientPreviewInput {
  /** Pass through the page-loaded ingredient/recipe catalog. */
  ctx: {
    ingredients: ReadonlyMap<string, IngredientLite>;
    recipes: ReadonlyMap<string, RecipeLite>;
  };
  items: RecipeItemLite[];
  recipe: {
    batchYieldUnits: number;
    batchYieldGrams: number;
    yieldLossPercent: number;
  };
  recipeId: string;
}

export type ClientPreview =
  | { ok: true; resolved: ResolvedRecipe }
  | { ok: false; error: string; code: "cycle" | "depth" | "missing" | "other" };

/**
 * Build an ephemeral ResolverContext where the current (in-flight)
 * recipe overrides whatever's in the cached catalog, then resolve.
 * Maps any resolver error to a user-facing Slovak message.
 */
export function computeClientPreview(input: ClientPreviewInput): ClientPreview {
  const recipes = new Map(input.ctx.recipes);
  const liveRecipe: RecipeLite = {
    id: input.recipeId,
    name: "",
    batchYieldUnits: input.recipe.batchYieldUnits,
    batchYieldGrams: input.recipe.batchYieldGrams,
    yieldLossPercent: input.recipe.yieldLossPercent,
    items: input.items,
  };
  recipes.set(input.recipeId, liveRecipe);

  const ctx: ResolverContext = {
    ingredients: input.ctx.ingredients,
    recipes,
  };

  try {
    const resolved = resolveRecipeCost(input.recipeId, ctx);
    return { ok: true, resolved };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    switch (name) {
      case "RecipeCycleError":
        return {
          ok: false,
          error: "Recept obsahuje cyklus",
          code: "cycle",
        };
      case "RecipeDepthError":
        return {
          ok: false,
          error: "Recept presahuje 3 úrovne subreceptov",
          code: "depth",
        };
      case "RecipeNotFoundError":
      case "IngredientNotFoundError":
        return { ok: false, error: "Chýba ingrediencia", code: "missing" };
      default:
        return {
          ok: false,
          error: "Výpočet zlyhal",
          code: "other",
        };
    }
  }
}

/**
 * Derive the set of allergen codes from a resolver run, sorted by
 * canonical order. Re-exported here so client code doesn't need to
 * pull the resolver's internals directly.
 */
export function allergensFromTrace(resolved: ResolvedRecipe): AllergenCode[] {
  return resolved.allergenCodes;
}
