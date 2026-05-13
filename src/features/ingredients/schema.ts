import { z } from "zod";
import {
  INGREDIENT_BASE_UNITS,
  INGREDIENT_NUTRITION_SOURCES,
} from "@/db/schema";
import { allergenCodeSchema } from "@/features/allergens/schema";

/**
 * Nutrition values per 100 g. EU 1169/2011 mandatory fields.
 * Bounds chosen to be permissive (some seeds, oils have very high values).
 */
export const nutritionPer100Schema = z.object({
  kcal: z.number().min(0).max(2000),
  protein: z.number().min(0).max(100),
  fat: z.number().min(0).max(100),
  saturatedFat: z.number().min(0).max(100),
  carbs: z.number().min(0).max(100),
  sugar: z.number().min(0).max(100),
  salt: z.number().min(0).max(100),
  fiber: z.number().min(0).max(100),
});

export type NutritionPer100Schema = z.infer<typeof nutritionPer100Schema>;

export const ingredientSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Názov je povinný")
      .max(100, "Názov je príliš dlhý"),
    slug: z.string().trim().min(1).max(120),
    baseUnit: z.enum(INGREDIENT_BASE_UNITS),
    gramsPerPiece: z.number().int().positive().nullable(),
    pricePerKgCents: z.number().int().min(0).nullable(),
    pricePerPieceCents: z.number().int().min(0).nullable(),
    supplierName: z.string().trim().max(100).nullable(),
    allergenCodes: z.array(allergenCodeSchema),
    nutritionPer100: nutritionPer100Schema.nullable(),
    nutritionSource: z.enum(INGREDIENT_NUTRITION_SOURCES),
    notes: z.string().trim().max(2000).nullable(),
    isActive: z.boolean(),
  })
  .refine(
    (v) =>
      v.baseUnit !== "piece" ||
      (v.gramsPerPiece !== null && v.gramsPerPiece > 0),
    {
      message: "Pri jednotke 'kus' musí byť zadaná hmotnosť za kus",
      path: ["gramsPerPiece"],
    }
  )
  .refine(
    (v) =>
      (v.baseUnit === "g" &&
        v.pricePerKgCents !== null &&
        v.pricePerPieceCents === null) ||
      (v.baseUnit === "piece" &&
        v.pricePerPieceCents !== null &&
        v.pricePerKgCents === null),
    {
      message: "Cena musí byť zadaná v jednotke zodpovedajúcej baseUnit",
      path: ["pricePerKgCents"],
    }
  );

export type IngredientSchema = z.infer<typeof ingredientSchema>;

export const updateIngredientSchema = z.object({
  id: z.string().min(1),
  data: ingredientSchema,
});

export type UpdateIngredientSchema = z.infer<typeof updateIngredientSchema>;

/**
 * Shape returned by the AI nutrition autofill action. The AI returns
 * the 8 nutrition values plus a confidence level and a source citation.
 */
export const aiNutritionSuggestionSchema = nutritionPer100Schema.extend({
  confidence: z.enum(["high", "medium", "low"]),
  source: z.string().max(200),
});

export type AiNutritionSuggestion = z.infer<typeof aiNutritionSuggestionSchema>;
