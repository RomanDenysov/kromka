/* eslint-disable no-console */
/**
 * Period resolution tests. Pure function, no DB. Run via:
 *   pnpm dlx tsx src/features/reports/lib/period.test.ts
 *
 * Exits non-zero on any failure.
 */
import { strict as assert } from "node:assert/strict";
import { resolvePeriod } from "./period";

interface Case {
  name: string;
  run: () => void;
}

const cases: Case[] = [];
const t = (name: string, run: () => void) => cases.push({ name, run });

// --- preset windows ----------------------------------------------------------

t("7d preset spans ~8 calendar days (from start-of-day to end-of-day)", () => {
  const p = resolvePeriod("7d");
  const days = (p.to.getTime() - p.from.getTime()) / 86_400_000;
  assert.ok(days > 7.9 && days < 8.1, `expected ~8 days, got ${days}`);
});

t("mtd preset starts on first of current month", () => {
  const p = resolvePeriod("mtd");
  assert.equal(p.from.getDate(), 1);
  assert.equal(p.from.getMonth(), new Date().getMonth());
  assert.equal(p.from.getFullYear(), new Date().getFullYear());
});

t("ytd preset starts on Jan 1 of current year", () => {
  const p = resolvePeriod("ytd");
  assert.equal(p.from.getMonth(), 0);
  assert.equal(p.from.getDate(), 1);
  assert.equal(p.from.getFullYear(), new Date().getFullYear());
});

t(
  "undefined preset defaults to ~31 days (30 + start/end-of-day padding)",
  () => {
    const p = resolvePeriod(undefined);
    const days = (p.to.getTime() - p.from.getTime()) / 86_400_000;
    assert.ok(days > 30.5 && days < 31.5, `expected ~31 days, got ${days}`);
  }
);

// --- previous window invariants ---------------------------------------------

t("previous window is contiguous and same length as current", () => {
  const p = resolvePeriod("7d");
  const currentLen = p.to.getTime() - p.from.getTime();
  const previousLen = p.previousTo.getTime() - p.previousFrom.getTime();
  assert.ok(
    Math.abs(currentLen - previousLen) < 2,
    `lengths should match (current=${currentLen}, prev=${previousLen})`
  );
  assert.ok(
    p.previousTo.getTime() < p.from.getTime(),
    "previousTo must precede from"
  );
});

// --- custom window -----------------------------------------------------------

t("custom preset with valid ISO dates uses them", () => {
  const p = resolvePeriod("custom", "2025-03-01", "2025-03-31");
  assert.equal(p.from.getFullYear(), 2025);
  assert.equal(p.from.getMonth(), 2);
  assert.equal(p.from.getDate(), 1);
  assert.equal(p.to.getFullYear(), 2025);
  assert.equal(p.to.getMonth(), 2);
  assert.equal(p.to.getDate(), 31);
});

t("custom preset with invalid 'from' falls back to default (~30d back)", () => {
  const p = resolvePeriod("custom", "not-a-date", "2025-03-31");
  const today = new Date();
  // from should be ~30 days before today, NOT NaN
  assert.ok(
    !Number.isNaN(p.from.getTime()),
    "from must be a valid date when input is malformed"
  );
  const daysBack = (today.getTime() - p.from.getTime()) / 86_400_000;
  assert.ok(
    daysBack > 29 && daysBack < 31,
    `expected ~30 days back, got ${daysBack}`
  );
});

t("custom preset with invalid 'to' falls back to today", () => {
  const p = resolvePeriod("custom", "2025-01-01", "garbage");
  assert.ok(
    !Number.isNaN(p.to.getTime()),
    "to must be a valid date when input is malformed"
  );
  // to should be end-of-day today
  const today = new Date();
  assert.equal(p.to.getFullYear(), today.getFullYear());
  assert.equal(p.to.getDate(), today.getDate());
});

t("custom preset with both invalid produces valid window (no NaN)", () => {
  const p = resolvePeriod("custom", "lol", "wat");
  assert.ok(!Number.isNaN(p.from.getTime()));
  assert.ok(!Number.isNaN(p.to.getTime()));
  assert.ok(!Number.isNaN(p.previousFrom.getTime()));
  assert.ok(!Number.isNaN(p.previousTo.getTime()));
});

t("custom preset with undefined custom dates falls back to defaults", () => {
  const p = resolvePeriod("custom");
  assert.ok(!Number.isNaN(p.from.getTime()));
  assert.ok(!Number.isNaN(p.to.getTime()));
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
  `\nPeriod resolver: ${passed} passed, ${failed} failed (${cases.length} total)`
);
process.exit(failed === 0 ? 0 : 1);
