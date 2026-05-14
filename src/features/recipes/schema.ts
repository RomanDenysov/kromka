import { z } from "zod";
import { RECIPE_KINDS, RECIPE_STATUSES } from "@/db/schema";

export const recipeHeaderSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Názov je povinný")
      .max(100, "Názov je príliš dlhý"),
    slug: z.string().trim().min(1).max(120),
    kind: z.enum(RECIPE_KINDS),
    status: z.enum(RECIPE_STATUSES),
    batchYieldUnits: z.number().int().positive("Výnos musí byť kladné číslo"),
    batchYieldGrams: z.number().int().min(0),
    yieldLossPercent: z.number().int().min(0).max(50),
    notes: z.string().trim().max(2000).nullable(),
  })
  .refine((v) => v.kind !== "product" || v.batchYieldGrams > 0, {
    message: "Produktový recept musí mať výťažnosť väčšiu ako 0 g",
    path: ["batchYieldGrams"],
  });

export type RecipeHeaderSchema = z.infer<typeof recipeHeaderSchema>;

export const addRecipeItemSchema = z
  .object({
    recipeId: z.string().min(1),
    ingredientId: z.string().min(1).nullable(),
    subRecipeId: z.string().min(1).nullable(),
    quantityBaseUnit: z.number().int().positive(),
  })
  .refine(
    (v) => Boolean(v.ingredientId) !== Boolean(v.subRecipeId),
    "Buď ingrediencia alebo subrecept, nie oboje"
  );

export type AddRecipeItemSchema = z.infer<typeof addRecipeItemSchema>;

export const updateRecipeItemSchema = z.object({
  itemId: z.string().min(1),
  quantityBaseUnit: z.number().int().positive(),
});

export type UpdateRecipeItemSchema = z.infer<typeof updateRecipeItemSchema>;

export const removeRecipeItemSchema = z.object({
  itemId: z.string().min(1),
});

export const reorderRecipeItemsSchema = z.object({
  recipeId: z.string().min(1),
  orderedItemIds: z.array(z.string().min(1)).min(1),
});

export const linkProductRecipeSchema = z.object({
  productId: z.string().min(1),
  recipeId: z.string().min(1).nullable(),
});

export type LinkProductRecipeSchema = z.infer<typeof linkProductRecipeSchema>;
