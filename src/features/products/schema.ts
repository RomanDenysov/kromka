import z from "zod";
import { WEIGHT_UNITS } from "@/db/types";
import { allergenCodeSchema } from "@/features/allergens/schema";
import { nutritionPer100Schema } from "@/features/ingredients/schema";
import { MAX_STRING_LENGTH } from "@/lib/constants";

const PRODUCT_STATUSES = ["draft", "active", "sold", "archived"] as const;

const MAX_DESCRIPTION_LENGTH = 2000;

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  status: z.enum(PRODUCT_STATUSES),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  priceCents: z.number(),
  weightValue: z.number().int().positive().nullable(),
  weightUnit: z.enum(WEIGHT_UNITS).nullable(),
});

export const updateProductSchema = z
  .object({
    ...productSchema.shape,
    categoryId: z.string().nullable(),
    imageId: z.string().nullable(),
    allergenCodes: z.array(allergenCodeSchema),
    /** Phase D: optional manual override; null = derive from recipe (or hide). */
    nutritionOverride: nutritionPer100Schema.nullable(),
  })
  .refine((data) => data.weightValue === null || data.weightUnit !== null, {
    message: "Weight value requires a unit",
    path: ["weightUnit"],
  });

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
