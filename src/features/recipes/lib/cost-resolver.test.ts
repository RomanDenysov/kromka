/* eslint-disable no-console */
/**
 * Resolver unit tests. Pure function, no DB. Run via:
 *   pnpm dlx tsx src/features/recipes/lib/cost-resolver.test.ts
 *
 * Exits non-zero on any failure. No vitest dependency for now —
 * keeps the PR scope small.
 */
import { strict as assert } from "node:assert/strict";
import {
  canAddSubRecipe,
  type IngredientLite,
  IngredientNotFoundError,
  RecipeCycleError,
  RecipeDepthError,
  type RecipeLite,
  RecipeNotFoundError,
  resolveRecipeCost,
} from "./cost-resolver";

interface Case {
  name: string;
  run: () => void;
}

const cases: Case[] = [];
const t = (name: string, run: () => void) => cases.push({ name, run });

// --- fixtures ---------------------------------------------------------------

const flour: IngredientLite = {
  id: "ing_flour",
  name: "Hladká múka T650",
  baseUnit: "g",
  gramsPerPiece: null,
  pricePerKgCents: 120, // 1,20 € / kg
  pricePerPieceCents: null,
  allergenCodes: ["gluten"],
};
const water: IngredientLite = {
  id: "ing_water",
  name: "Voda",
  baseUnit: "g",
  gramsPerPiece: null,
  pricePerKgCents: 0, // zero-priced; flags hasPrice = false
  pricePerPieceCents: null,
  allergenCodes: [],
};
const salt: IngredientLite = {
  id: "ing_salt",
  name: "Soľ",
  baseUnit: "g",
  gramsPerPiece: null,
  pricePerKgCents: 50, // 0,50 € / kg
  pricePerPieceCents: null,
  allergenCodes: [],
};
const egg: IngredientLite = {
  id: "ing_egg",
  name: "Vajce M",
  baseUnit: "piece",
  gramsPerPiece: 50,
  pricePerKgCents: null,
  pricePerPieceCents: 20, // 0,20 € / piece
  allergenCodes: ["eggs"],
};

// Final product recipe: 20 rolls per batch, 1500 g raw, 12% loss
const recipeRoll: RecipeLite = {
  id: "rec_roll",
  name: "Rožok klasický",
  batchYieldUnits: 20,
  batchYieldGrams: 1500,
  yieldLossPercent: 12,
  items: [
    { ingredientId: "ing_flour", subRecipeId: null, quantityBaseUnit: 1000 },
    { ingredientId: "ing_water", subRecipeId: null, quantityBaseUnit: 600 },
    { ingredientId: "ing_salt", subRecipeId: null, quantityBaseUnit: 20 },
  ],
};

// Sub-recipe: kvások (sourdough starter) — 500 g batch, 50 g flour + 50 g water
const recipeStarter: RecipeLite = {
  id: "rec_starter",
  name: "Kvások",
  batchYieldUnits: 1,
  batchYieldGrams: 100,
  yieldLossPercent: 0,
  items: [
    { ingredientId: "ing_flour", subRecipeId: null, quantityBaseUnit: 50 },
    { ingredientId: "ing_water", subRecipeId: null, quantityBaseUnit: 50 },
  ],
};

// Recipe that uses kvások as a sub-recipe.
const recipeStarterRoll: RecipeLite = {
  id: "rec_starter_roll",
  name: "Rožok s kváskom",
  batchYieldUnits: 10,
  batchYieldGrams: 1000,
  yieldLossPercent: 10,
  items: [
    { ingredientId: "ing_flour", subRecipeId: null, quantityBaseUnit: 500 },
    { ingredientId: null, subRecipeId: "rec_starter", quantityBaseUnit: 200 },
  ],
};

// Recipe with eggs (piece-based)
const recipePalacinka: RecipeLite = {
  id: "rec_palacinka",
  name: "Palacinky",
  batchYieldUnits: 10,
  batchYieldGrams: 800,
  yieldLossPercent: 5,
  items: [
    { ingredientId: "ing_flour", subRecipeId: null, quantityBaseUnit: 250 },
    { ingredientId: "ing_egg", subRecipeId: null, quantityBaseUnit: 3 },
  ],
};

const baseCtx = () => ({
  ingredients: new Map<string, IngredientLite>([
    [flour.id, flour],
    [water.id, water],
    [salt.id, salt],
    [egg.id, egg],
  ]),
  recipes: new Map<string, RecipeLite>([
    [recipeRoll.id, recipeRoll],
    [recipeStarter.id, recipeStarter],
    [recipeStarterRoll.id, recipeStarterRoll],
    [recipePalacinka.id, recipePalacinka],
  ]),
});

// --- tests -----------------------------------------------------------------

t("mass-based ingredient: cost = quantity_g * cents_per_kg / 1000", () => {
  const ctx = baseCtx();
  const r = resolveRecipeCost("rec_roll", ctx);
  // flour: 1000g * 120c/kg / 1000 = 120c
  // water: 0c (no price)
  // salt: 20g * 50c/kg / 1000 = 1c
  // batch = 121c, per unit = round(121/20) = 6c
  assert.equal(r.batchCostCents, 121);
  assert.equal(r.costPerUnitCents, 6);
  assert.deepEqual(r.allergenCodes, ["gluten"]);
});

t("zero-priced ingredient is flagged but doesn't throw", () => {
  const ctx = baseCtx();
  const r = resolveRecipeCost("rec_roll", ctx);
  const waterRow = r.trace.find((i) => i.refId === "ing_water");
  assert.ok(waterRow);
  assert.equal(waterRow.hasPrice, false);
  assert.equal(waterRow.totalCostCents, 0);
});

t("piece-based ingredient: cost = quantity * cents_per_piece", () => {
  const ctx = baseCtx();
  const r = resolveRecipeCost("rec_palacinka", ctx);
  // flour: 250g * 120 / 1000 = 30c
  // egg: 3 * 20c = 60c
  // batch = 90c
  assert.equal(r.batchCostCents, 90);
  assert.deepEqual(r.allergenCodes.sort(), ["eggs", "gluten"]);
});

t("piece-based mass contribution uses gramsPerPiece", () => {
  const ctx = baseCtx();
  const r = resolveRecipeCost("rec_palacinka", ctx);
  const eggRow = r.trace.find((i) => i.refId === "ing_egg");
  assert.ok(eggRow);
  assert.equal(eggRow.massGrams, 150); // 3 * 50g
});

t("yield loss applied to finished mass", () => {
  const ctx = baseCtx();
  const r = resolveRecipeCost("rec_roll", ctx);
  // 1500 * (1 - 12/100) = 1320
  assert.equal(r.finishedMassGrams, 1320);
});

t("sub-recipe contributes per-gram cost", () => {
  const ctx = baseCtx();
  const r = resolveRecipeCost("rec_starter_roll", ctx);
  // starter: flour 50g * 120/1000 = 6c, water 0, batch=6c, finishedMass=100g
  // per gram of starter = 6/100 = 0.06c
  // host uses 200g starter -> 200 * 0.06 = 12c
  // host flour 500g * 120/1000 = 60c
  // total = 72c
  assert.equal(r.batchCostCents, 72);
  assert.deepEqual(r.allergenCodes, ["gluten"]);
});

t("cycle detected: A -> B -> A", () => {
  const ctx = baseCtx();
  // Inject a cycle by making rec_starter reference rec_starter_roll.
  ctx.recipes.set("rec_starter", {
    ...recipeStarter,
    items: [
      ...recipeStarter.items,
      {
        ingredientId: null,
        subRecipeId: "rec_starter_roll",
        quantityBaseUnit: 10,
      },
    ],
  });
  assert.throws(
    () => resolveRecipeCost("rec_starter_roll", ctx),
    (err: Error) => err instanceof RecipeCycleError
  );
});

t("depth exceeded: 4-level chain throws RecipeDepthError", () => {
  const ctx = baseCtx();
  // a -> b -> c -> d -> e (5 levels, exceeds MAX_RECIPE_DEPTH=3)
  const chain = ["a", "b", "c", "d", "e"];
  for (let i = 0; i < chain.length; i++) {
    const next = chain[i + 1];
    ctx.recipes.set(chain[i], {
      id: chain[i],
      name: chain[i],
      batchYieldUnits: 1,
      batchYieldGrams: 100,
      yieldLossPercent: 0,
      items: next
        ? [{ ingredientId: null, subRecipeId: next, quantityBaseUnit: 10 }]
        : [
            {
              ingredientId: "ing_flour",
              subRecipeId: null,
              quantityBaseUnit: 10,
            },
          ],
    });
  }
  assert.throws(
    () => resolveRecipeCost("a", ctx),
    (err: Error) => err instanceof RecipeDepthError
  );
});

t("missing ingredient throws IngredientNotFoundError", () => {
  const ctx = baseCtx();
  ctx.recipes.set("rec_dangling", {
    id: "rec_dangling",
    name: "Dangling",
    batchYieldUnits: 1,
    batchYieldGrams: 100,
    yieldLossPercent: 0,
    items: [
      {
        ingredientId: "ing_does_not_exist",
        subRecipeId: null,
        quantityBaseUnit: 100,
      },
    ],
  });
  assert.throws(
    () => resolveRecipeCost("rec_dangling", ctx),
    (err: Error) => err instanceof IngredientNotFoundError
  );
});

t("missing recipe throws RecipeNotFoundError", () => {
  const ctx = baseCtx();
  assert.throws(
    () => resolveRecipeCost("rec_does_not_exist", ctx),
    (err: Error) => err instanceof RecipeNotFoundError
  );
});

t("canAddSubRecipe: self rejected", () => {
  const r = canAddSubRecipe("a", "a", new Map());
  assert.deepEqual(r, { ok: false, reason: "self" });
});

t("canAddSubRecipe: ok for unrelated leaves", () => {
  const graph = new Map<string, readonly string[]>([
    ["a", []],
    ["b", []],
  ]);
  assert.deepEqual(canAddSubRecipe("a", "b", graph), { ok: true });
});

t("canAddSubRecipe: cycle when candidate uses host transitively", () => {
  // host a, candidate b which uses c which uses a.
  const graph = new Map<string, readonly string[]>([
    ["a", []],
    ["b", ["c"]],
    ["c", ["a"]],
  ]);
  assert.deepEqual(canAddSubRecipe("a", "b", graph), {
    ok: false,
    reason: "cycle",
  });
});

// --- Phase D: nutrition tests ---

t(
  "nutrition: per-100g flows from ingredients into batch + per-100g output",
  () => {
    const ctx = baseCtx();
    // Add nutrition to flour: 360 kcal/100g, 10g protein/100g
    ctx.ingredients.set("ing_flour", {
      ...flour,
      nutritionPer100: {
        kcal: 360,
        protein: 10,
        fat: 1,
        saturatedFat: 0.2,
        carbs: 75,
        sugar: 0.3,
        salt: 0.01,
        fiber: 2.5,
      },
    });
    const r = resolveRecipeCost("rec_roll", ctx);
    // flour: 1000g; scale = 1000/100 = 10x → 3600 kcal contribution
    // water + salt have no nutrition → contribute 0; nutritionIncomplete = true
    assert.equal(r.nutritionIncomplete, true);
    assert.equal(r.batchNutrition.kcal, 3600);
    // finished mass = 1320g; per-100g = 3600 / 1320 * 100 ≈ 273
    assert.equal(r.nutritionPer100.kcal, 273);
  }
);

t(
  "nutrition: ingredient without nutritionPer100 contributes zero, flagged",
  () => {
    const ctx = baseCtx();
    const r = resolveRecipeCost("rec_roll", ctx);
    assert.equal(r.batchNutrition.kcal, 0);
    assert.equal(r.nutritionIncomplete, true);
    // All trace items should have hasNutrition = false
    for (const t of r.trace) {
      assert.equal(t.hasNutrition, false);
    }
  }
);

t("nutrition: piece-based item uses gramsPerPiece for mass", () => {
  const ctx = baseCtx();
  ctx.ingredients.set("ing_egg", {
    ...egg,
    nutritionPer100: {
      kcal: 140,
      protein: 12,
      fat: 9.5,
      saturatedFat: 3,
      carbs: 1,
      sugar: 1,
      salt: 0.4,
      fiber: 0,
    },
  });
  const r = resolveRecipeCost("rec_palacinka", ctx);
  // egg: 3 pieces * 50g = 150g; 150/100 = 1.5x → 210 kcal contribution
  const eggRow = r.trace.find((i) => i.refId === "ing_egg");
  assert.ok(eggRow);
  assert.equal(eggRow.hasNutrition, true);
  assert.equal(eggRow.contributedNutrition.kcal, 210);
});

t("canAddSubRecipe: depth exceeded when adding would push past 3", () => {
  // host already at depth 2; candidate has its own 2-level chain.
  const graph = new Map<string, readonly string[]>([
    ["a", []],
    ["x", ["y"]],
    ["y", []],
  ]);
  const r = canAddSubRecipe("a", "x", graph, 3);
  assert.equal(r.ok, false);
});

// --- runner -----------------------------------------------------------------

let pass = 0;
let fail = 0;
for (const c of cases) {
  try {
    c.run();
    console.log(`  ✓ ${c.name}`);
    pass++;
  } catch (err) {
    console.error(`  ✗ ${c.name}`);
    console.error(err);
    fail++;
  }
}
console.log(
  `\nResolver: ${pass} passed, ${fail} failed (${cases.length} total)`
);
if (fail > 0) {
  process.exit(1);
}
