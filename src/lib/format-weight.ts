import type { WeightUnit } from "@/db/types";

const UNIT_THRESHOLD = 1000;

export function formatWeight(
  value: number | null | undefined,
  unit: WeightUnit | null | undefined
): string | null {
  if (!(value && unit)) {
    return null;
  }
  if (unit === "g" && value >= UNIT_THRESHOLD) {
    return `${(value / UNIT_THRESHOLD).toLocaleString("sk-SK")} kg`;
  }
  if (unit === "ml" && value >= UNIT_THRESHOLD) {
    return `${(value / UNIT_THRESHOLD).toLocaleString("sk-SK")} l`;
  }
  return `${value} ${unit}`;
}
