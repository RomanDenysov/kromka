import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { AllergenCode } from "@/features/allergens/schema";
import type { NutritionPer100Schema } from "@/features/ingredients/schema";
import { getResolverContext } from "@/features/recipes/api/queries";
import { resolveRecipeCost } from "@/features/recipes/lib/cost-resolver";

export interface ProductDisplay {
  allergenCodes: AllergenCode[];
  allergenSource: "derived" | "manual";
  nutrition: NutritionPer100Schema | null;
  nutritionIncomplete: boolean;
  nutritionSource: "computed" | "override" | "none";
}

/**
 * Consolidated PDP data source for allergens + nutrition.
 *
 * Resolution rules:
 * - Allergens: derived from recipe when the product has one and the
 *   resolver succeeds; otherwise fall back to the manual
 *   products.allergenCodes column (Phase A).
 * - Nutrition: override (jsonb on products) wins if set; otherwise
 *   derived from recipe; otherwise null (PDP hides the section).
 */
export async function getDerivedProductDisplay(
  productId: string
): Promise<ProductDisplay> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${productId}`, "recipes", "ingredients");

  const row = await db
    .select({
      id: products.id,
      allergenCodes: products.allergenCodes,
      recipeId: products.recipeId,
      nutritionOverride: products.nutritionOverride,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!row[0]) {
    return {
      allergenCodes: [],
      allergenSource: "manual",
      nutrition: null,
      nutritionSource: "none",
      nutritionIncomplete: false,
    };
  }

  const product = row[0];
  const manualAllergens = product.allergenCodes as AllergenCode[];
  const override = product.nutritionOverride as NutritionPer100Schema | null;

  // If admin set a nutrition override, use it verbatim. Allergens still
  // try to derive from the recipe.
  let allergenCodes = manualAllergens;
  let allergenSource: "derived" | "manual" = "manual";
  let computedNutrition: NutritionPer100Schema | null = null;
  let nutritionIncomplete = false;

  if (product.recipeId) {
    try {
      const ctx = await getResolverContext({ includeDrafts: false });
      const resolved = resolveRecipeCost(product.recipeId, ctx);
      allergenCodes = resolved.allergenCodes;
      allergenSource = "derived";
      computedNutrition = resolved.nutritionPer100;
      nutritionIncomplete = resolved.nutritionIncomplete;
    } catch {
      // Resolver threw — fall back to manual allergens, hide nutrition.
      allergenCodes = manualAllergens;
      allergenSource = "manual";
    }
  }

  let nutrition: NutritionPer100Schema | null;
  let nutritionSource: "computed" | "override" | "none";
  if (override) {
    nutrition = override;
    nutritionSource = "override";
  } else if (computedNutrition && !nutritionIncomplete) {
    nutrition = computedNutrition;
    nutritionSource = "computed";
  } else {
    nutrition = null;
    nutritionSource = "none";
  }

  return {
    allergenCodes,
    allergenSource,
    nutrition,
    nutritionSource,
    nutritionIncomplete,
  };
}
