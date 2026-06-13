# Recipe & Costing Arc — Overview & Cross-Cutting Decisions

This document is the cross-cutting reference for the five-phase arc that delivers allergens, ingredients, recipes, nutrition, and ERP profitability. Each phase spec is self-contained but defers shared decisions (pricing model, role guards, cache tags, mobile expectations, rollback thresholds) to this document so the same choices don't have to be re-discussed five times.

Read this first. Then read the phase you're implementing.

---

## 1. Phase sequencing

```
[Pre-A scaffolding] → A → B → C → D → E
```

| Stage | Output | Customer-visible? | Approx duration |
|---|---|---|---|
| Pre-A scaffolding | Product page tab refactor, `order_items.unitCostCents` column, role-guard split | No | 1 day |
| A — Allergens | Manual allergen tags + PDP chips | Yes | 1 sprint |
| B — Ingredients catalog | Ingredient CRUD, price history, fuzzy search, dup detection, AI nutrition autofill | No | 1-2 sprints |
| Resolver prototype | Pure-function tests for cost + cycle/depth | No | 1 day |
| C — Recipes + cost | Builder, resolver, order snapshot, recipe duplication, picker dual-mode | No | 2-3 sprints |
| D — Nutrition + PDP | Nutrition compute extension, PDP nutrition table, allergen source switch, drift report | Yes | 1 sprint |
| E — ERP profitability | Store + product P&L, ingredient trends, CSV export, dashboard widget | No (admin) | 1-2 sprints |

**Why pre-A scaffolding exists:** three files get touched 2-3 times each across A/C/D for pure restructure work. Doing the restructure once up front means each phase touches files for substantive reasons.

---

## 2. Pre-A scaffolding (do this once)

A 1-day chunk of pure plumbing, no business logic, no schema risk. Outputs:

### 2a. `order_items.unitCostCents` column

Nullable integer column on `order_items`. Phase A's migration adds it. Phase A doesn't populate it; Phase C is the first phase that writes a value. Lives in Phase A's migration because every order created between A's ship date and C's ship date would otherwise be permanently missing cost data.

```typescript
// in order_items pgTable definition
unitCostCents: integer("unit_cost_cents"),   // null until Phase C populates
```

### 2b. Product detail page tab structure

Wrap the existing product form in shadcn `<Tabs>`. Initial tabs: **Info** | **Recenzie** (existing reviews). URL search param `?tab=info|recenzie`, default `info`.

Future phases extend without re-restructuring:
- Phase A puts the allergen picker inside Info tab
- Phase C adds a **Recept** tab
- Phase D modifies allergen picker behaviour inside Info tab
- Phase E adds nothing here

### 2c. Role guard split

Add these guards to `src/lib/auth/guards.ts` next to the existing `requireAdmin`, `requireAuth`, `requireStaff`:

```typescript
// Resource-scoped guards; each maps to a set of roles
export const requireProductEdit   = () => requireRoles(["admin", "manager"]);
export const requireRecipeView    = () => requireRoles(["admin", "manager"]);  // baker added in Phase 4
export const requireRecipeEdit    = () => requireRoles(["admin", "manager"]);
export const requireCostView      = () => requireRoles(["admin", "manager"]);
export const requireIngredientEdit = () => requireRoles(["admin", "manager"]);
export const requireReportsView   = () => requireRoles(["admin", "manager"]);
```

Each phase uses the resource-scoped guard. When `baker` role lands (ERP Phase 4), only `requireRecipeView` adds it. Zero churn across feature code.

### 2d. New module loggers

`src/lib/logger.ts` — add namespaces that will be used by the arc:
- `ingredients` (Phase B)
- `recipes` (Phase C)
- `nutrition` (Phase D)
- `reports` (Phase E)

All four added at once in pre-A to avoid one-line edits scattered across phases.

---

## 3. Pricing model (canonical)

**Single source of truth for how money is stored across the entire arc.**

### Storage

| Column | Applies when | Unit |
|---|---|---|
| `ingredients.pricePerKgCents` | `baseUnit = 'g'` | integer cents per kilogram |
| `ingredients.pricePerPieceCents` | `baseUnit = 'piece'` | integer cents per single piece |

Exactly one is non-null, enforced by CHECK:

```sql
CHECK (
  (base_unit = 'g'     AND price_per_kg_cents IS NOT NULL AND price_per_piece_cents IS NULL)
  OR
  (base_unit = 'piece' AND price_per_piece_cents IS NOT NULL AND price_per_kg_cents IS NULL)
)
```

### Why per-kg instead of per-100g or per-gram

Every realistic supplier price is integer-exact at cents/kg granularity:

| Supplier price | Stored as |
|---|---|
| €4.00/kg | 400 |
| €1.20/kg | 120 |
| €0.85/kg | 85 |
| €4.99 per 500 g packet | 998 |
| €2.49/kg | 249 |

Per-gram rounds 0.4 → 0 (useless). Per-100g rounds 0.85 → 0.8 (6% error per ingredient). Per-kg never rounds.

### Admin form: input flexibility

Admin types whatever the invoice says; the form normalizes on save.

```
Cena                  [4.00]  €  za  [▼ 1 kg          ]
                                       ├ 1 kg
                                       ├ 500 g
                                       ├ 100 g
                                       ├ 1 kus       (piece-based only)
                                       └ 12 kusov    (piece-based only)

Uložené ako: 400 c/kg
```

Live "Uložené ako" hint shows the normalized value so admins catch input mistakes.

### Resolver math

Inside `src/features/recipes/lib/cost-resolver.ts`:

```typescript
// mass-based item (always quantity in grams)
itemCostCents = Math.round(quantityGrams * ingredient.pricePerKgCents / 1000);

// piece-based item (always quantity in pieces)
itemCostCents = quantityPieces * ingredient.pricePerPieceCents;
```

One division by 1000 at compute time. No precision loss.

### Display helper

`src/features/ingredients/lib/format.ts`:

```typescript
// Always shows both representations: "4,00 €/kg (0,40 €/100g)"
export function formatPricePerUnit(ing: IngredientLite): string;
```

Customers think in per-100g (matching nutrition labels), staff think in per-kg (matching invoices). Display both, store one.

### Price history mirrors the same shape

`ingredient_price_history` carries the same two columns. Every price change appends a row. Phase E reports walk the history without any conversion logic.

---

## 4. Role matrix

What each role sees / can do across the arc:

| Capability | admin | manager | baker (Phase 4) | user (customer) |
|---|---|---|---|---|
| View products | ✅ | ✅ | ✅ | public PDP |
| Edit products | ✅ | ✅ | ❌ | ❌ |
| View ingredients catalog | ✅ | ✅ | ❌ | ❌ |
| Edit ingredients | ✅ | ✅ | ❌ | ❌ |
| View recipes | ✅ | ✅ | ✅ | ❌ |
| Edit recipes | ✅ | ✅ | ❌ | ❌ |
| View cost (per recipe, per order) | ✅ | ✅ | ❌ | ❌ |
| View nutrition on PDP | ✅ | ✅ | ✅ | ✅ |
| View profitability reports | ✅ | ✅ | ❌ | ❌ |

Bakers see recipes (they execute them) but never cost numbers. Customers see PDP allergens + nutrition. Everyone else is gated.

**Implementation:** use the resource-scoped guards from [§2c](#2c-role-guard-split). Per-store row-level access (a manager assigned to store A sees only store A's reports) lives behind an additional check inside `requireReportsView` once Phase 4 introduces store-staff assignments.

---

## 5. Cache tag matrix

Central reference for which tags get invalidated by which mutations. **Update this file whenever a new tag or mutation is added.**

### Tags by scope

| Tag | Set by | TTL |
|---|---|---|
| `allergens` | `getAllergens` | `cacheLife("max")` |
| `products` | All product queries | `cacheLife("hours")` |
| `product-${slug}` | PDP query (Phase D) | `cacheLife("hours")` |
| `ingredients` | All ingredient queries | `cacheLife("hours")` |
| `ingredient-${id}` | `getIngredientById` | `cacheLife("hours")` |
| `ingredient-${id}-prices` | `getIngredientPriceHistory` | `cacheLife("hours")` |
| `recipes` | All recipe queries + `getResolverContext` | `cacheLife("hours")` |
| `recipe-${id}` | `getRecipeById` | `cacheLife("hours")` |
| `reports` | All Phase E queries | `cacheLife("hours")` |
| `reports-stores`, `reports-products`, `reports-summary`, `reports-distribution`, `reports-ingredients-${id}`, `reports-ingredient-impact-${id}` | Phase E sub-queries | `cacheLife("hours")` |

### Invalidations by action

| Mutation | Tags invalidated |
|---|---|
| `updateProductAction` (Phase A+) | `products`, `reports` |
| `createIngredientAction` (Phase B) | `ingredients`, `recipes`, `reports` |
| `updateIngredientAction` (no price change) | `ingredients`, `ingredient-${id}` |
| `updateIngredientAction` (price changed) | `ingredients`, `ingredient-${id}`, `ingredient-${id}-prices`, `recipes`, `reports` |
| `deleteIngredientAction` | `ingredients`, `ingredient-${id}` |
| `createRecipeAction` (Phase C) | `recipes` |
| `updateRecipeHeaderAction` | `recipes`, `recipe-${id}`, `products` |
| `addRecipeItemAction` / `updateRecipeItemAction` / `removeRecipeItemAction` / `reorderRecipeItemsAction` | `recipes`, `recipe-${recipeId}`, `products` (cost preview on PDP), `reports` |
| `linkProductRecipeAction` | `products`, `product-${slug}`, `recipes` |
| `publishRecipeAction` | `recipes`, `recipe-${id}`, `reports` |
| `updateProductAction` with `nutritionOverride` (Phase D) | `products`, `product-${slug}` |
| `aiAutofillNutritionAction` confirm (Phase B+) | `ingredients`, `ingredient-${id}` |
| Order creation / status change (Phase C+) | `orders`, `reports` |

**Rule of thumb:** any mutation that changes data feeding into a report invalidates `reports`. Any mutation that changes recipe-derived data invalidates `products` so PDP reflects it.

---

## 6. Mobile expectations matrix

| Phase | Surface | Mobile expectation |
|---|---|---|
| A | PDP allergen chips | Full support (already mobile-friendly) |
| A | Admin product form | Existing form behaviour, no special mobile work |
| B | Admin ingredients list & form | Functional on mobile; price input dropdown collapses cleanly |
| C | Recipe builder | **Desktop-only.** Mobile shows read-only view with "Úpravy receptu sú možné len na počítači" banner |
| C | Recipe list | Functional on mobile |
| D | PDP nutrition table | Full support; EU-format table works on narrow screens |
| D | Drift report | Desktop-first; mobile usable but cramped |
| E | Reports | Desktop-first; charts degrade to scrollable; KPI cards stack vertically |

The only hard "desktop-only" decision is the Phase C recipe builder. Everything else degrades.

---

## 7. Rollback / one-way thresholds

When each phase becomes effectively one-way (rolling back loses real data or user expectations):

| Phase | Becomes one-way at |
|---|---|
| Pre-A scaffolding | Immediately reversible (drop column, undo tab wrap) |
| A — Allergens | After ~1 week of admin tagging — losing manual allergen data would mean re-entering |
| B — Ingredients | After admins enter real prices + nutrition — losing this is days of work |
| C — Recipes + cost | The moment real orders start having `unitCostCents` populated. Past that, rollback loses real data. |
| D — Nutrition + PDP | After customers start seeing nutrition labels on PDP — backward step is a customer-visible regression |
| E — Reports | After admins start relying on the reports to make decisions — soft expectation lock-in |

Each spec should refer back here rather than re-discussing rollback.

---

## 8. Pre-build prototypes

Three areas where 1 day of prototyping pays for itself before the actual spec build starts:

| Prototype | Goal | Outcome |
|---|---|---|
| Resolver pure function | Confidence in cycle/depth/missing-data behaviour, reusable test fixture | TypeScript file with tests covering all error paths, before the rest of Phase C touches it |
| `useOptimistic` + dnd-kit + autosave (Phase C items table) | Validate the spreadsheet feel is achievable; uncover ordering bugs before they spread | Tiny throwaway page with 3 rows, drag reorder, debounced autosave |
| `<IngredientForm variant="page" \| "sheet">` (Phase B → Phase C bridge) | Lock the dual-mode contract so Phase C can be built in parallel with Phase B | Storybook-ish or `/admin/production/ingredients/_demo` page exercising both modes |

---

## 9. Fuzzy search & duplicate detection

Used by Phase B ingredient picker and admin tools.

### Postgres extensions (one-time)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Added in Phase B's migration since that's where ingredient name search becomes a load-bearing UX.

### Indexed lookup

```sql
CREATE INDEX idx_ingredients_name_trgm
  ON ingredients USING gin (lower(unaccent(name)) gin_trgm_ops);
```

Enables:
- Diacritic-free matching: "muka" → "Hladká múka T650"
- Substring matching: "T550" → "Hladká múka T550"
- Trigram similarity for duplicate detection at create time

### Duplicate detection in ingredient form

On the create form, after the admin types a name, query similar existing ingredients and surface them as suggestions:

```sql
SELECT id, name
FROM ingredients
WHERE similarity(lower(unaccent(name)), lower(unaccent($1))) > 0.6
ORDER BY similarity(...) DESC
LIMIT 5;
```

UI shows "Možno máte na mysli: Hladká múka T650, Polohrubá múka — klik pre vybranie". Click selects the existing ingredient and closes the create dialog.

### Periodic cleanup tool

`/admin/production/ingredients/duplicates` — admin page listing pairs above the similarity threshold for review. Read-only diagnostic; no automated merge. Useful for catching diacritic typos and slightly different supplier names for the same thing.

### Why not pgvector

Vector embeddings would handle semantic matches like "biela múka" → "Hladká múka T550" (no trigram overlap, same concept). For our bakery scale and well-known vocabulary, pg_trgm + admin discipline is enough. Vectors stay out of scope for the catalog. **If we ever do vectors, it's for recipe similarity, not ingredient search** — a Phase C+ feature, not a Phase B refactor.

---

## 10. Cross-cutting non-goals

Things that are deliberately out of scope across the entire arc, even though they keep coming up:

- **"May contain traces" / cross-contamination warnings.** Removed in the spike. No room.
- **Multi-currency.** EUR only.
- **Multi-language ingredient or recipe names.** Slovak only. Allergens have `nameSk` + `nameEn` (one-time seed cost). Everything else is single-Slovak.
- **Manual override of computed allergens.** No override layer. Allergens come from the recipe ingredients (Phase D); products without a recipe use the manual `allergenCodes` column (Phase A) as fallback.
- **Recipe versioning / history.** Cost snapshot on `order_items.unitCostCents` covers historical correctness; full recipe history is too much engineering for too little business value.
- **`ml` as a base unit.** Two units only: `g` and `piece`. Liquids stored in grams.
- **Public-facing ingredient list ("Z čoho je vyrobené") on PDP.** Future consideration; not in this arc.
- **B2B-format printable nutrition labels.** Future; the data model supports it.
- **Inventory tracking** (stock, expiry, reorder). ERP Phase 4 store-manager work, not part of this arc.
- **Bulk CSV import** for ingredients or recipes. Out of scope.
- **Real-time / streaming reports.** Cached with `cacheLife("hours")`. Good enough.

---

## 11. Testing strategy

Each spec lists its specific acceptance criteria. The arc-wide testing expectations:

| Test target | Phase | Why |
|---|---|---|
| Cost resolver (`src/features/recipes/lib/cost-resolver.ts`) | C | Pure function, recursive, easy to make subtly wrong; the highest-value test surface in the arc |
| Nutrition extension to the resolver | D | Same reasoning; adds new math paths to the same function |
| Cycle / depth / missing-ingredient error paths | C | Silent failures here propagate to wrong costs in production |
| Order-snapshot fallback (cost resolver throws → NULL persisted, no checkout failure) | C | Critical: cost tracking must never break checkout |
| Phase E SQL aggregations on a fixture order set | E | Easy to get a FILTER aggregate subtly wrong, hard to spot in a chart |
| `<IngredientForm>` dual-mode contract | B | Phase C depends on it before Phase C exists; lock the API early |

Tests are written with the existing test runner (Vitest or whatever the project uses). The resolver is a pure function with no DB, so unit tests are cheap.

---

## 12. Open questions kept here so phase specs don't drift

The following are decided once here and referenced from each phase:

1. **Energy on labels: `kJ / kcal`** (both, kJ first) — EU 1169/2011 mandate.
2. **Salt vs sodium on PDP: salt only.** Schema.org JSON-LD gets sodium via `salt × 0.4` conversion at render time.
3. **PDP decimals:** kcal → whole number, grams → 1 decimal, kJ → whole number, Slovak decimal comma.
4. **Order statuses counted as a sale** in Phase E: `["new", "in_progress", "ready_for_pickup", "completed"]`. Excludes `cancelled` and `refunded`.
5. **Per-store row-level filtering** in Phase E reports: filter shape (`storeIds?: string[]`) is in the query signatures from day one; actual enforcement waits for Phase 4 store-staff assignments.
6. **Recipe duplication is MVP in Phase C** (not a stretch). The 5-recipes-in-and-you're-reusing pattern is the dominant workflow.
7. **Ingredient picker has two modes:** "Ingrediencie" + "Z iného receptu" — pulling all items from another recipe is the fastest path to building recipe N when recipe N-1 is similar.
