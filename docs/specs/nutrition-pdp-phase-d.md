# Nutrition Derivation & PDP Display (Phase D) — Implementation Spec

> **Read first:** [`_arc-overview.md`](./_arc-overview.md). The AI nutrition autofill originally scheduled for this phase **moved into Phase B** — by the time Phase D ships, ingredients already have nutrition data populated. Phase D's scope is therefore smaller than originally drafted.

## Overview

Compute nutrition values per 100 g of finished product from the recipe (extending the Phase C resolver), surface allergens + nutrition on the public product detail page, switch the PDP allergen source from the manual Phase A column to ingredient-driven derivation (for products with a recipe), and ship the drift report. After this phase the customer-facing product page is fully informed by the recipe graph; the manual `allergenCodes` column on products stays as fallback for products without a recipe.

## Goals

- Recipe resolver produces nutrition per 100 g of finished product alongside cost (single pass, single source of truth).
- PDP renders a standard EU-format nutrition table (Energia / Tuky / Sacharidy / ... / Soľ) for every product with a recipe.
- PDP allergen list switches data source from `products.allergenCodes` (manual) to derived from recipe ingredients for products with a recipe.
- Products **without** a recipe keep using the manual `allergenCodes` column — fallback path.
- Admin can override computed nutrition per product when the computed value is wrong (suppliers' missing data, unusual loss profiles).
- JSON-LD on PDP gains `nutritionInformation`.
- Drift report identifies products where manual `allergenCodes` and derived list disagree.

**Not in this phase anymore (moved to Phase B):** AI nutrition autofill body + dialog. Ingredients already have nutrition data when Phase D ships.

## Non-goals

- Per-ingredient yield loss (recipe-level `yieldLossPercent` from Phase C is enough).
- Any change to the recipe builder's UX beyond the new "Nutričné hodnoty" tile in the live preview panel.
- Allergen filtering on the e-shop listing page (deferred — easy add later from `getDerivedAllergens()`).
- B2B-format printable EU labels (downloadable PDF). Out of scope; revisit in a future phase.
- Bulk AI nutrition fill (one ingredient at a time only).
- Storing AI-generated draft revisions for review queues. Direct write with admin confirmation.

---

## Prerequisites

- Phase A — `allergens` reference table + `products.allergenCodes` + tab structure (`Info | Recenzie`).
- Phase B — `ingredients` table with `nutritionPer100` jsonb + `nutritionSource` enum + `gramsPerPiece` + the AI autofill flow already shipped (so ingredients are populated by the time Phase D runs).
- Phase C — `recipes`, `recipe_items`, `products.recipeId`, `cost-resolver.ts`, `getResolverContext()`, the **Recept** tab on the product page.

If any of A/B/C have not shipped, Phase D cannot start.

---

## What to build

### 1. Schema changes (`src/db/schema.ts`) — REQUIRES HUMAN APPROVAL

Two small additions; nothing dropped (the deprecation of `products.allergenCodes` is a future cleanup, not a Phase D step — see [Allergen source migration](#3-allergen-source-migration)).

#### `products.nutritionOverride` (new column)

```typescript
nutritionOverride: jsonb("nutrition_override").$type<NutritionPer100>(),
```

Nullable. When non-null, PDP and admin display it verbatim and skip computation. Same shape as `ingredients.nutritionPer100` (defined in Phase B).

#### `ingredients.nutritionSource` enum extension

Phase B's enum was `["manual", "ai", "supplier", "seed"]`. No change here — Phase B already added `'ai'` for forward compatibility. The AI autofill action sets it to `'ai'` after saving.

#### Migration

`pnpm db:generate` produces a one-line ALTER TABLE for `products`. No backfill — the column starts NULL across the board.

---

### 2. Resolver extension (`src/features/recipes/lib/cost-resolver.ts`)

Extend the Phase C resolver to compute nutrition in the same recursive pass. Cost and nutrition share the recursion, the visited-set, the cycle/depth checks — walking it twice would be wasteful and risk drift.

#### Extended return shape

```typescript
export type ResolvedRecipe = {
  // existing (Phase C)
  batchCostCents: number;
  costPerUnitCents: number;
  allergenCodes: AllergenCode[];
  finishedMassGrams: number;
  trace: ResolvedRecipeItem[];

  // new (Phase D)
  batchNutrition: NutritionPer100;     // sum across batch, in absolute grams/kcal
  nutritionPer100: NutritionPer100;    // per 100 g of finished product
};
```

`ResolvedRecipeItem` gets a `contributedNutrition: NutritionPer100` field for the live preview to show ingredient-level breakdown if needed (defer rendering this; data is there for free).

#### Algorithm additions

For each item walked:

```typescript
// inside the items loop in resolveRecipeCost():
let itemNutrition: NutritionPer100;
let itemMassGrams: number;

if (item.ingredientId) {
  const ing = ctx.ingredients.get(item.ingredientId)!;
  itemMassGrams = ing.baseUnit === "g"
    ? item.quantityBaseUnit
    : item.quantityBaseUnit * (ing.gramsPerPiece ?? 0);
  if (ing.nutritionPer100 && itemMassGrams > 0) {
    itemNutrition = scaleNutrition(ing.nutritionPer100, itemMassGrams / 100);
  } else {
    itemNutrition = ZERO_NUTRITION;
  }
} else if (item.subRecipeId) {
  const sub = resolveRecipeCost(item.subRecipeId, ctx, new Set(visited));
  // sub-recipe is consumed by mass; quantity is in grams of the sub-recipe
  itemMassGrams = item.quantityBaseUnit;
  const fraction = sub.finishedMassGrams > 0
    ? itemMassGrams / sub.finishedMassGrams
    : 0;
  itemNutrition = scaleNutrition(sub.batchNutrition, fraction);
}

// accumulate into recipe totals
batchNutrition = sumNutrition(batchNutrition, itemNutrition);
```

After the loop:

```typescript
const nutritionPer100 = finishedMassGrams > 0
  ? scaleNutrition(batchNutrition, 100 / finishedMassGrams)
  : ZERO_NUTRITION;
```

`scaleNutrition(n, factor)` and `sumNutrition(a, b)` are pure helpers (8-line each, in the same file or a sibling `nutrition-math.ts`).

#### Edge cases

- **Ingredient without nutrition data** (`nutritionPer100 IS NULL`): contributes zero. Resolver does not throw. Live preview surfaces a chip: "N suroviny bez nutričných hodnôt" so the admin knows the result is incomplete.
- **`gramsPerPiece` missing on a piece-based ingredient** (Phase B's CHECK should prevent this; defensive zero-mass fallback): contributes zero, log warn.
- **`finishedMassGrams = 0`** (admin hasn't entered batch yield): `nutritionPer100` is the zero blob, preview shows "Zadajte hmotnosť šarže".

These cases must not break the resolver. The error states already established for cycle / depth / missing recipe stay the only fatal paths.

---

### 3. Allergen source migration

The substantive customer-facing change. PDP today reads `products.allergenCodes` (Phase A); Phase D switches to derived.

#### New query: `getDerivedProductDisplay(productId)`

`src/features/products/api/queries.ts` — single function that returns the display data PDP needs:

```typescript
type ProductDisplay = {
  product: Product;
  allergens: Allergen[];                 // resolved Allergen rows (with nameSk)
  nutrition: NutritionPer100 | null;     // null when no recipe AND no override
  nutritionPresent: boolean;
  costSource: "computed" | "override" | "none";  // for admin debugging only
};

export async function getDerivedProductDisplay(productId: string): Promise<ProductDisplay>;
```

Resolution rules:

| Allergens source | Triggered when |
|---|---|
| Derived (recipe → ingredients) | Product has `recipeId` and recipe resolves successfully |
| Manual fallback (`products.allergenCodes`) | Product has no `recipeId`, OR resolver throws |

| Nutrition source | Triggered when |
|---|---|
| Override (`products.nutritionOverride`) | Column is non-null |
| Computed (resolver) | Recipe exists and resolves successfully |
| None | Neither |

Caching: `cacheLife("hours")`, tags `products`, `product-${id}`, `recipes` (so any recipe edit invalidates dependent products). Resolver context is fetched once per call via `getResolverContext()` (Phase C).

#### Updated PDP fetch

`src/app/(public)/(pages)/product/[slug]/page.tsx` calls `getDerivedProductDisplay(result.id)` in parallel with the existing slug query, then passes both to render.

#### Phase A column status

`products.allergenCodes` is **not** dropped in Phase D. It stays as the manual fallback for products without a recipe. The admin product form continues to show the Phase A allergen picker, but its label/help text changes:

> "Tieto alergény sa použijú len pre produkty bez priradeného receptu. Pri produkte s receptom sa alergény vypočítajú zo surovín."

When a recipe is linked the picker becomes read-only with a banner showing the derived list and a link to the recipe.

#### Drift detection (admin tool)

A new admin page `/admin/recipes/drift` (or a section on `/admin/recipes`) that lists products where manual `allergenCodes` differs from derived allergens. Pure read-only diagnostic — no automated reconciliation. Admin can:
- Click a row to open the product
- See what changed
- Decide to clear the manual column (since recipe wins anyway) or fix the recipe

This is the safety net for the migration. It also runs as a one-time pass when Phase D ships, surfacing every product whose manual list disagrees with the (now-authoritative) recipe-derived list.

---

### 4. PDP rendering

#### Allergens section

The existing Phase A `<AllergenList>` component stays in place; only the data source changes (now reading from `getDerivedProductDisplay()`). Empty state behavior unchanged: returns `null` when no allergens.

#### New: nutrition table

**Component:** `src/features/nutrition/components/nutrition-table.tsx`

Server component. Renders the EU-format nutrition table (Slovak labels):

```
Nutričné hodnoty na 100 g

Energia                 1192 kJ / 285 kcal
Tuky                    3,2 g
   z toho nasýtené      0,8 g
Sacharidy               55 g
   z toho cukry         3 g
Vláknina                4 g
Bielkoviny              9 g
Soľ                     1,2 g
```

- Slovak number formatting (decimal comma, EU locale)
- Two columns: label + value
- Saturated fat and sugars are nested under their parents with em-space indent
- Renders `null` when no nutrition data is available (no recipe AND no override)
- Below the table, a small line: "Hodnoty sú vypočítané z receptu" or "Hodnoty zadané manuálne", subdued styling

Energy calculation: kJ from kcal via the standard 4.184 multiplier.

Returns `null` (not an empty card) when there's nothing to show — silence is the right default for products that don't have nutrition data yet.

#### PDP integration

`src/app/(public)/(pages)/product/[slug]/page.tsx` — add `<NutritionTable nutrition={display.nutrition} source={display.nutritionSource} />` below the existing allergen section.

#### JSON-LD update

The PDP already emits `Product` JSON-LD around line 150. Add `nutritionInformation` per [Schema.org/NutritionInformation](https://schema.org/NutritionInformation):

```typescript
nutritionInformation: nutrition ? {
  "@type": "NutritionInformation",
  servingSize: "100 g",
  calories: `${nutrition.kcal} kcal`,
  fatContent: `${nutrition.fat} g`,
  saturatedFatContent: `${nutrition.saturatedFat} g`,
  carbohydrateContent: `${nutrition.carbs} g`,
  sugarContent: `${nutrition.sugar} g`,
  proteinContent: `${nutrition.protein} g`,
  fiberContent: `${nutrition.fiber} g`,
  sodiumContent: `${nutrition.salt * 0.4} g`,   // salt → sodium conversion
} : undefined,
```

---

### 5. Admin: nutrition override

#### Product form additions

`src/app/(admin)/admin/products/[id]/_components/product-form.tsx` — Info tab gets a new collapsible section "Manuálne nutričné hodnoty" between Description and Allergens. Closed by default.

When opened:
- Toggle: "Použiť ručné nutričné hodnoty" (writes/clears `products.nutritionOverride`)
- 8 numeric inputs (same as Phase B's `<NutritionFields>` — reuse the component)
- Below: a read-only preview of the **computed** nutrition (when recipe exists) so admin can see what they'd be overriding

The toggle behavior:
- Off → `nutritionOverride = null`, computed value used
- On → `nutritionOverride = { ... }`, manual value used. Defaulting on first toggle copies the currently-computed values so the admin starts from a sensible baseline.

#### New schema field on `updateProductSchema`

```typescript
nutritionOverride: nutritionPer100Schema.nullable(),
```

Reused from Phase B's Zod schema.

#### Recipe builder live preview gets a nutrition tile

`src/features/recipes/components/live-preview-panel.tsx` — section already had a "Nutričné /100g" placeholder mention in Phase C; Phase D fills it in:

```
Nutričné /100g
Energia       285 kcal
Bielkoviny    9 g
Tuky          3 g
   nasýtené   0,8 g
Sacharidy     55 g
   cukry      3 g
Vláknina      4 g
Soľ           1,2 g
```

If any walked ingredient has `nutritionPer100 = null`, show a small chip: "N surovín bez nutričných hodnôt" with click-to-jump to the offending row.

---

### 6. AI nutrition autofill — moved to Phase B

This section originally specced the body of `aiAutofillNutritionAction` + the confirmation dialog. The work shipped in Phase B instead (see [`ingredients-phase-b.md` §7](./ingredients-phase-b.md#7-ai-nutrition-autofill)) so admins could populate the ingredient catalog with real nutrition data **before** Phase C's recipe builder needed it.

No work in Phase D on this surface. Move on.

---

### 7. Caching strategy

Tag map for the new flows:

| Mutation | Tags invalidated |
|---|---|
| Recipe header / item edit | `recipes`, `recipe-${id}`, `products` (PDP allergens + nutrition come from the resolver) |
| Ingredient nutrition or price edit | `ingredients`, `ingredient-${id}`, `recipes` (because resolver context is cached as a whole graph) |
| Product `nutritionOverride` change | `products`, `product-${id}` |
| Product `recipeId` link/unlink | `products`, `product-${id}`, `recipes` |

`getResolverContext()` (Phase C) tagged with both `ingredients` and `recipes` so either invalidates the whole graph. Acceptable: edits are rare relative to reads.

---

### 8. Drift report admin tool

`src/app/(admin)/admin/recipes/drift/page.tsx` — read-only diagnostic. Paginated to stay performant as the product catalog grows.

**Data source:** a dedicated cached query `getAllergenDrift({ offset, limit })` that walks products page-by-page rather than loading the entire catalog into memory:

```typescript
"use cache";
export async function getAllergenDrift(opts: { offset?: number; limit?: number }) {
  cacheLife("hours");
  cacheTag("recipes", "products", "allergens-drift");
  // Returns { items: DriftRow[], total: number }
  // Each DriftRow: { productId, productName, manualCodes, derivedCodes, added, removed }
  // Only rows where added.length + removed.length > 0 are returned
}
```

The query uses `getResolverContext()` once and walks the requested page of products. Default page size 50, max 100. With 200 products this is one request; with 2000 it's 40 requests with cache reuse.

Page renders:
- Table of mismatches
- Product name + link (to `/admin/products/[id]?tab=recept`)
- Manual allergens (chips)
- Derived allergens (chips)
- Diff column: added (green) / removed (red)
- Pager at the bottom
- Empty state: green "Žiadne rozdiely" panel

No edit actions on this page — admin clicks through to fix at the source.

---

## File summary

| Action | File |
|---|---|
| Edit | `src/db/schema.ts` — `products.nutritionOverride` (**human approval**) |
| Generate | `drizzle/NNNN_nutrition_override.sql` migration |
| Edit | `src/features/recipes/lib/cost-resolver.ts` — extend to compute nutrition |
| Create | `src/features/recipes/lib/nutrition-math.ts` — `scaleNutrition`, `sumNutrition`, `ZERO_NUTRITION` |
| Edit | `src/features/recipes/lib/client-preview.ts` — surface nutrition in client preview |
| Edit | `src/features/recipes/components/live-preview-panel.tsx` — render nutrition tile |
| Create | `src/features/products/api/queries.ts` — add `getDerivedProductDisplay`, `getAllergenDrift` |
| Edit | `src/features/products/schema.ts` — add `nutritionOverride` to `updateProductSchema` |
| Edit | `src/features/products/api/actions.ts` — persist `nutritionOverride` in `updateProductAction` |
| Create | `src/features/nutrition/components/nutrition-table.tsx` — public PDP component |
| Create | `src/features/nutrition/lib/format-nutrition.ts` — Slovak number formatting |
| Edit | `src/app/(public)/(pages)/product/[slug]/page.tsx` — fetch derived display + render `<NutritionTable>` + extend JSON-LD |
| Edit | `src/app/(admin)/admin/products/[id]/_components/product-form.tsx` — nutrition override section in Info tab; allergen picker becomes read-only when recipe exists |
| Create | `src/app/(admin)/admin/recipes/drift/page.tsx` — paginated drift report |
| Edit | `docs/database-schema.md` — document new column |
| Edit | `docs/features-catalog.json` — extend `products`, `recipes` entries; new `nutrition` feature; update `lastUpdated` |
| Edit | `CLAUDE.md` — note that PDP allergens/nutrition derive from recipes |

---

## Constraints

- **No `db.transaction()` / `db.batch()`** — no multi-row writes in Phase D anyway.
- **No barrel files** — direct imports.
- **No dynamic imports of internal modules.**
- **Slovak language** for user-facing text.
- **`requireProductEdit()`** for the new product override action; **public** queries (`getDerivedProductDisplay`) need no guard. `getAllergenDrift` runs behind `requireRecipeView()` on the page.
- **Schema changes require human approval** before editing `src/db/schema.ts`.
- **No `pnpm db:push`** — generate + migrate.
- **Costs in cents**, **nutrition in grams / kcal** (kJ derived).
- **Structured logging** via `log.nutrition.error()` (from pre-A scaffolding) and `log.products.warn()`.
- **`cacheLife("hours")` + `cacheTag()`** on all queries; mutations invalidate per [arc overview §5](./_arc-overview.md#5-cache-tag-matrix).

---

## Performance notes

- `getDerivedProductDisplay()` runs the resolver per product on cache miss. With ~200 products and `cacheLife("hours")`, the worst case is 200 resolver runs per hour. Each resolver run is sub-millisecond (in-memory walk). Negligible.
- Nutrition computation reuses the resolver's existing recursion — no additional DB hits.
- AI autofill is admin-triggered, one ingredient at a time. No background jobs.
- JSON-LD payload grows by ~250 bytes per product page. Acceptable.

---

## Open questions / decisions to lock

1. **Energy unit display: kcal only, or kJ + kcal?** EU labelling regulations (Reg. 1169/2011) require **both** kJ and kcal in that order. Spec defaults to "kJ / kcal" rendering. Lock in.
2. **Salt vs sodium.** EU labels use salt; Schema.org/NutritionInformation uses `sodiumContent`. Conversion: salt × 0.4 ≈ sodium. Spec applies in JSON-LD only; admin UI and PDP show salt only.
3. **Decimals shown on PDP.** Standard Slovak rounding: kcal to whole, grams to one decimal, energy in kJ to whole. Lock in unless you have a different convention.
4. **AI model choice.** `claude-sonnet-4-5` is the default for Phase D. Could downgrade to Haiku for cost; nutrition-fact lookups don't need high reasoning. Recommend starting with Sonnet 4.5 (per `claude-api` skill conventions) and revisiting if cost bites. ~50 calls one-time, ~5 cents total either way.
5. **Drift report frequency.** Phase D ships the page; suggest no automated digest email yet. Admin checks ad-hoc. If drift becomes common we add a weekly summary.
6. **Should `products.allergenCodes` ever be dropped?** Recommended: keep it indefinitely. Real-world bakery has products without recipes (resold packaged items, simple drinks). The fallback is structurally cheap and removes no signal.

---

## Acceptance criteria

- [ ] Schema migration adds `products.nutritionOverride`, no backfill needed
- [ ] Resolver returns both `cost` and `nutrition` in one pass; cycle/depth/missing-data behavior unchanged
- [ ] Resolver unit tests cover the new nutrition math paths (per [arc overview §11](./_arc-overview.md#11-testing-strategy))
- [ ] PDP renders the EU-format nutrition table for any product with a recipe
- [ ] PDP allergen list shows derived allergens when product has a recipe; falls back to manual when not
- [ ] When `nutritionOverride` is set, PDP shows the override and labels it "Hodnoty zadané manuálne"
- [ ] Recipe live preview shows nutrition per 100 g and warns about ingredients with missing nutrition data
- [ ] JSON-LD on PDP includes `nutritionInformation` when available
- [ ] Drift report is paginated (server-side), default 50 per page; empty state when in sync
- [ ] All cache tags invalidate correctly per [arc overview §5](./_arc-overview.md#5-cache-tag-matrix): edit ingredient nutrition → product PDP nutrition updates after `revalidateTag` fires
- [ ] Admin product form: allergen picker becomes read-only when a recipe is linked, with a banner pointing at the recipe
- [ ] No barrel files; no dynamic imports of internal modules; the new admin action guarded by `requireProductEdit()`

---

## Out of scope (Phase E / future)

- Phase E: store-level P&L queries built on `unitCostCents` (snapshotted in Phase C) + `ingredient_price_history` (Phase B)
- Bulk AI autofill across the catalog
- AI-suggested allergens (Phase B's regex helper is enough)
- B2B-format printable nutrition labels (PDF download)
- Allergen-based filtering on the e-shop listing page
- Per-ingredient yield loss
- Public-facing ingredient list ("Z čoho je vyrobené") on PDP
- Cross-product nutrition comparison views
- Customer reviews tied to nutrition values
