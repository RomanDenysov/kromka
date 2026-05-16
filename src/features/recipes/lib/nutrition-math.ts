import type { NutritionPer100Schema } from "@/features/ingredients/schema";

export const ZERO_NUTRITION: NutritionPer100Schema = {
  kcal: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  carbs: 0,
  sugar: 0,
  salt: 0,
  fiber: 0,
};

const KEYS: Array<keyof NutritionPer100Schema> = [
  "kcal",
  "protein",
  "fat",
  "saturatedFat",
  "carbs",
  "sugar",
  "salt",
  "fiber",
];

/** Scale every field by the given factor. */
export function scaleNutrition(
  n: NutritionPer100Schema,
  factor: number
): NutritionPer100Schema {
  const out = { ...ZERO_NUTRITION };
  for (const k of KEYS) {
    out[k] = n[k] * factor;
  }
  return out;
}

/** Element-wise sum. */
export function sumNutrition(
  a: NutritionPer100Schema,
  b: NutritionPer100Schema
): NutritionPer100Schema {
  const out = { ...ZERO_NUTRITION };
  for (const k of KEYS) {
    out[k] = a[k] + b[k];
  }
  return out;
}

/** Round all values to sensible precision for storage / display. */
export function roundNutrition(
  n: NutritionPer100Schema
): NutritionPer100Schema {
  return {
    kcal: Math.round(n.kcal),
    protein: round1(n.protein),
    fat: round1(n.fat),
    saturatedFat: round1(n.saturatedFat),
    carbs: round1(n.carbs),
    sugar: round1(n.sugar),
    salt: round2(n.salt),
    fiber: round1(n.fiber),
  };
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** kJ from kcal via the standard 4.184 multiplier. */
export function kJFromKcal(kcal: number): number {
  return Math.round(kcal * 4.184);
}
