import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import {
  type AllergenCode,
  allergenCodeSchema,
} from "@/features/allergens/schema";
import type { NutritionPer100Schema } from "@/features/ingredients/schema";
import { getResolverContext } from "@/features/recipes/api/queries";
import { resolveRecipeCost } from "@/features/recipes/lib/cost-resolver";
import { log } from "@/lib/logger";

interface ProductDisplayBase {
  allergenCodes: AllergenCode[];
  allergenSource: "derived" | "manual";
  nutritionIncomplete: boolean;
}

export type ProductDisplay = ProductDisplayBase &
  (
    | { nutrition: null; nutritionSource: "none" }
    | {
        nutrition: NutritionPer100Schema;
        nutritionSource: "computed" | "override";
      }
  );

const manualAllergensSchema = z.array(allergenCodeSchema);

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
  const parsed = manualAllergensSchema.safeParse(product.allergenCodes ?? []);
  if (!parsed.success) {
    log.products.warn(
      { err: parsed.error, productId },
      "Invalid allergen codes in DB; falling back to empty manual list"
    );
  }
  const manualAllergens: AllergenCode[] = parsed.success ? parsed.data : [];
  const override = product.nutritionOverride as NutritionPer100Schema | null;

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
    } catch (err) {
      log.products.warn(
        { err, productId, recipeId: product.recipeId },
        "Recipe cost resolver failed; falling back to manual allergens"
      );
      allergenCodes = manualAllergens;
      allergenSource = "manual";
    }
  }

  const base: ProductDisplayBase = {
    allergenCodes,
    allergenSource,
    nutritionIncomplete,
  };
  if (override) {
    return { ...base, nutrition: override, nutritionSource: "override" };
  }
  if (computedNutrition && !nutritionIncomplete) {
    return {
      ...base,
      nutrition: computedNutrition,
      nutritionSource: "computed",
    };
  }
  return { ...base, nutrition: null, nutritionSource: "none" };
}
