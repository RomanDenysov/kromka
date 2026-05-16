import { z } from "zod";

/**
 * EU 14 mandatory allergen codes (Regulation 1169/2011 Annex II).
 *
 * This list MUST match the rows seeded into the `allergens` table by
 * migration 0008. CI check: SELECT count(*) FROM allergens === ALLERGEN_CODES.length.
 *
 * Order is informational only; rendering order comes from `allergens.sortOrder`.
 */
export const ALLERGEN_CODES = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soybeans",
  "milk",
  "tree_nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
] as const;

export const allergenCodeSchema = z.enum(ALLERGEN_CODES);
export type AllergenCode = z.infer<typeof allergenCodeSchema>;

export const updateProductAllergensSchema = z.object({
  productId: z.string().min(1),
  codes: z.array(allergenCodeSchema),
});

export type UpdateProductAllergensSchema = z.infer<
  typeof updateProductAllergensSchema
>;
