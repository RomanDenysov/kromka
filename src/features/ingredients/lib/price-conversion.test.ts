/* eslint-disable no-console */
/**
 * Price normalization tests. Pure function, no DB. Run via:
 *   pnpm dlx tsx src/features/ingredients/lib/price-conversion.test.ts
 *
 * Exits non-zero on any failure.
 */
import { strict as assert } from "node:assert/strict";
import { normalizePriceInput } from "./price-conversion";

interface Case {
  name: string;
  run: () => void;
}

const cases: Case[] = [];
const t = (name: string, run: () => void) => cases.push({ name, run });

// --- happy path: mass --------------------------------------------------------

t("kg input on mass ingredient -> cents/kg passthrough", () => {
  const r = normalizePriceInput({
    amountEur: 1.2,
    inputUnit: "kg",
    baseUnit: "g",
  });
  assert.equal(r.kg, 120);
  assert.equal(r.piece, null);
});

t("500g input on mass ingredient -> doubled cents/kg", () => {
  const r = normalizePriceInput({
    amountEur: 0.6,
    inputUnit: "500g",
    baseUnit: "g",
  });
  assert.equal(r.kg, 120);
  assert.equal(r.piece, null);
});

t("100g input on mass ingredient -> 10x cents/kg", () => {
  const r = normalizePriceInput({
    amountEur: 0.12,
    inputUnit: "100g",
    baseUnit: "g",
  });
  assert.equal(r.kg, 120);
  assert.equal(r.piece, null);
});

// --- happy path: piece -------------------------------------------------------

t("1piece input on piece ingredient -> cents/piece passthrough", () => {
  const r = normalizePriceInput({
    amountEur: 0.25,
    inputUnit: "1piece",
    baseUnit: "piece",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, 25);
});

t("12 pieces (tucet) divides cents evenly", () => {
  const r = normalizePriceInput({
    amountEur: 3,
    inputUnit: "12pieces",
    baseUnit: "piece",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, 25);
});

t("6 pieces input divides cents evenly", () => {
  const r = normalizePriceInput({
    amountEur: 1.5,
    inputUnit: "6pieces",
    baseUnit: "piece",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, 25);
});

// --- unit/baseUnit mismatch --------------------------------------------------

t("piece input on mass ingredient returns nulls", () => {
  const r = normalizePriceInput({
    amountEur: 5,
    inputUnit: "1piece",
    baseUnit: "g",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, null);
});

t("mass input on piece ingredient returns nulls", () => {
  const r = normalizePriceInput({
    amountEur: 5,
    inputUnit: "kg",
    baseUnit: "piece",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, null);
});

// --- invalid amounts ---------------------------------------------------------

t("negative amount returns nulls", () => {
  const r = normalizePriceInput({
    amountEur: -1,
    inputUnit: "kg",
    baseUnit: "g",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, null);
});

t("NaN amount returns nulls", () => {
  const r = normalizePriceInput({
    amountEur: Number.NaN,
    inputUnit: "kg",
    baseUnit: "g",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, null);
});

t("Infinity amount returns nulls", () => {
  const r = normalizePriceInput({
    amountEur: Number.POSITIVE_INFINITY,
    inputUnit: "kg",
    baseUnit: "g",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, null);
});

t("negative Infinity amount returns nulls", () => {
  const r = normalizePriceInput({
    amountEur: Number.NEGATIVE_INFINITY,
    inputUnit: "1piece",
    baseUnit: "piece",
  });
  assert.equal(r.kg, null);
  assert.equal(r.piece, null);
});

// --- edge values -------------------------------------------------------------

t("zero amount yields zero cents", () => {
  const r = normalizePriceInput({
    amountEur: 0,
    inputUnit: "kg",
    baseUnit: "g",
  });
  assert.equal(r.kg, 0);
  assert.equal(r.piece, null);
});

t("sub-cent amount rounds away from zero (100g)", () => {
  // 1 cent for 100 g -> 10 cents/kg (multiplied 10x, no rounding needed)
  const r = normalizePriceInput({
    amountEur: 0.01,
    inputUnit: "100g",
    baseUnit: "g",
  });
  assert.equal(r.kg, 10);
  assert.equal(r.piece, null);
});

t("10 pieces divides 1.05€ to 10 (Math.round)", () => {
  // 105 cents / 10 = 10.5 -> rounds to 11
  const r = normalizePriceInput({
    amountEur: 1.05,
    inputUnit: "10pieces",
    baseUnit: "piece",
  });
  assert.equal(r.piece, 11);
});

// --- runner ------------------------------------------------------------------

let passed = 0;
let failed = 0;
for (const c of cases) {
  try {
    c.run();
    console.log(`  ✓ ${c.name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${c.name}`);
    console.error(err);
    failed++;
  }
}
console.log(
  `\nPrice conversion: ${passed} passed, ${failed} failed (${cases.length} total)`
);
process.exit(failed === 0 ? 0 : 1);
