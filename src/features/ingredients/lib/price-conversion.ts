import type { IngredientBaseUnit } from "@/db/schema";

/**
 * Admin-facing units that can be entered in the price input. Internally
 * everything normalizes to cents/kg (mass) or cents/piece (piece).
 *
 * See docs/specs/_arc-overview.md §3.
 */
export type MassInputUnit = "kg" | "500g" | "100g";
export type PieceInputUnit = "1piece" | "12pieces" | "10pieces" | "6pieces";
export type PriceInputUnit = MassInputUnit | PieceInputUnit;

export const MASS_INPUT_UNITS: readonly MassInputUnit[] = [
  "kg",
  "500g",
  "100g",
];
export const PIECE_INPUT_UNITS: readonly PieceInputUnit[] = [
  "1piece",
  "6pieces",
  "10pieces",
  "12pieces",
];

const MASS_UNIT_GRAMS: Record<MassInputUnit, number> = {
  kg: 1000,
  "500g": 500,
  "100g": 100,
};

const PIECE_UNIT_COUNT: Record<PieceInputUnit, number> = {
  "1piece": 1,
  "6pieces": 6,
  "10pieces": 10,
  "12pieces": 12,
};

export const MASS_UNIT_LABELS: Record<MassInputUnit, string> = {
  kg: "1 kg",
  "500g": "500 g",
  "100g": "100 g",
};

export const PIECE_UNIT_LABELS: Record<PieceInputUnit, string> = {
  "1piece": "1 kus",
  "6pieces": "6 kusov",
  "10pieces": "10 kusov",
  "12pieces": "12 kusov (tucet)",
};

export function isMassInputUnit(u: PriceInputUnit): u is MassInputUnit {
  return (MASS_INPUT_UNITS as readonly string[]).includes(u);
}

/**
 * Convert admin-entered amount (in euros, e.g. "4.00") + chosen input
 * unit into canonical cents-per-kg or cents-per-piece. Returns null when
 * the input is not a finite number.
 */
export function normalizePriceInput({
  amountEur,
  inputUnit,
  baseUnit,
}: {
  amountEur: number;
  inputUnit: PriceInputUnit;
  baseUnit: IngredientBaseUnit;
}): { kg: number | null; piece: number | null } {
  if (!Number.isFinite(amountEur) || amountEur < 0) {
    return { kg: null, piece: null };
  }
  const cents = Math.round(amountEur * 100);

  if (baseUnit === "g") {
    if (!isMassInputUnit(inputUnit)) {
      return { kg: null, piece: null };
    }
    const grams = MASS_UNIT_GRAMS[inputUnit];
    const perKg = Math.round((cents * 1000) / grams);
    return { kg: perKg, piece: null };
  }

  if (isMassInputUnit(inputUnit)) {
    return { kg: null, piece: null };
  }
  const count = PIECE_UNIT_COUNT[inputUnit];
  const perPiece = Math.round(cents / count);
  return { kg: null, piece: perPiece };
}

/**
 * Format the canonical cents value back into "X,XX €" for the
 * "Uložené ako" hint and read-only displays.
 */
export function formatCentsAsEur(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return "—";
  }
  const eur = cents / 100;
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(eur);
}
