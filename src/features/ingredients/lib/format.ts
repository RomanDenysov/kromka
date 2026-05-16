import type { IngredientBaseUnit } from "@/db/schema";
import { formatCentsAsEur } from "./price-conversion";

/**
 * Render the base unit chip on tables / detail views.
 */
export function formatBaseUnit(baseUnit: IngredientBaseUnit): string {
  return baseUnit === "g" ? "g" : "ks";
}

/**
 * Headline price label used by admin lists and the recipe builder.
 * Shows both cents/kg and per-100g for mass ingredients (admins think in
 * per-kg, customers think in per-100g — show both).
 */
export function formatPricePerUnit({
  baseUnit,
  pricePerKgCents,
  pricePerPieceCents,
}: {
  baseUnit: IngredientBaseUnit;
  pricePerKgCents: number | null;
  pricePerPieceCents: number | null;
}): string {
  if (baseUnit === "piece") {
    if (pricePerPieceCents === null) {
      return "—";
    }
    return `${formatCentsAsEur(pricePerPieceCents)} / ks`;
  }

  if (pricePerKgCents === null) {
    return "—";
  }
  const per100g = Math.round(pricePerKgCents / 10);
  return `${formatCentsAsEur(pricePerKgCents)} / kg (${formatCentsAsEur(per100g)} / 100 g)`;
}

/**
 * Compact label, for places where the full string is too long
 * (e.g. recipe builder picker rows).
 */
export function formatPricePerUnitShort({
  baseUnit,
  pricePerKgCents,
  pricePerPieceCents,
}: {
  baseUnit: IngredientBaseUnit;
  pricePerKgCents: number | null;
  pricePerPieceCents: number | null;
}): string {
  if (baseUnit === "piece") {
    return `${formatCentsAsEur(pricePerPieceCents)} / ks`;
  }
  return `${formatCentsAsEur(pricePerKgCents)} / kg`;
}
