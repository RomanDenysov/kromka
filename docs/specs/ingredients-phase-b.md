# Ingredients Catalog (Phase B) — Implementation Spec

> **Read first:** [`_arc-overview.md`](./_arc-overview.md) for the canonical pricing model, role guards, cache tags, fuzzy search, and cross-cutting non-goals.

## Overview

Build the ingredients catalog — the raw-materials database that backs recipes (Phase C) and nutrition derivation (Phase D). Admin gets full CRUD over ingredients with name, base unit (`g` or `piece`), price (stored as cents/kg or cents/piece, entered in any supplier-natural unit), nutrition values per 100 g, allergen tags, and optional supplier info. A separate price-history table records cost changes over time so future ERP reports can analyze margin trends without losing fidelity.

This phase is admin-only — no public-facing or B2B changes. Phase B is a foundation: nothing in it is visible to customers until Phase C wires recipes and Phase D computes nutrition.

Phase B includes two pieces that were originally scheduled for Phase D, brought forward because they collapse the dominant data-entry bottleneck:

1. **AI nutrition autofill** — body of the Claude SDK call (Phase D originally).
2. **Fuzzy search + duplicate detection** — pg_trgm-powered ingredient picker and a `/admin/ingredients/duplicates` review tool.

## Goals

- Admin can create, edit, list, search (fuzzy, diacritic-free), and (soft-)deactivate ingredients.
- Each ingredient has a single base unit: `g` or `piece`. No `ml`.
- Price is stored as integer cents per kg (mass) or per piece (piece), normalized from any supplier-natural input unit.
- Allergen tagging via the Phase A `allergens` reference table.
- Nutrition values per 100 g entered manually OR via the AI autofill flow (Claude SDK, admin confirms before persist).
- Duplicate detection at create time — type "Hladka muka" and see existing "Hladká múka T650" as a suggestion before saving a dup.
- Price changes are written to `ingredient_price_history` automatically so historical cost reconstruction works.
- Seeded bakery ingredient list (~50 entries) — names + allergens + base unit only. Prices and nutrition are filled by admins through the form (price) and AI autofill (nutrition), not in the seed.

## Non-goals

- Multi-supplier price comparison per ingredient (single current supplier name; one historical row per change).
- Inventory tracking (stock levels, expiry, reorder points). Out of scope until ERP Phase 4 store-manager wave.
- Unit conversion to `ml` (deliberately dropped — see Phase A spike). Liquids stored in grams.
- Automatic price imports from supplier feeds. Manual entry only.
- Vector embeddings for semantic ingredient search. pg_trgm covers our scale. See [arc overview §9](./_arc-overview.md#9-fuzzy-search--duplicate-detection).
- Bulk CSV import.
- Any public-facing display.

---

## Prerequisites

- Phase A allergens reference table (`allergens` with `code` PK and seeded EU 14 rows). Required for the `<AllergenPicker>` reuse and for FK semantics on `ingredients.allergenCodes`.
- Pre-A scaffolding: role guards (`requireIngredientEdit`), `ingredients` module logger. See [arc overview §2](./_arc-overview.md#2-pre-a-scaffolding-do-this-once).
- `ANTHROPIC_API_KEY` env var (for AI nutrition autofill). Document in `.env.example`. The form gracefully disables the AI button when the key is missing.

---

## What to build

### 1. Schema changes (`src/db/schema.ts`) — REQUIRES HUMAN APPROVAL

#### Postgres extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Added at the top of Phase B's migration. `pg_trgm` powers the fuzzy ingredient search and duplicate detection; `unaccent` strips diacritics so "muka" matches "múka". See [arc overview §9](./_arc-overview.md#9-fuzzy-search--duplicate-detection).

#### New table: `ingredients`

The pricing model uses two **XOR** columns (`pricePerKgCents` or `pricePerPieceCents`), enforced by CHECK. See [arc overview §3](./_arc-overview.md#3-pricing-model-canonical) for the full rationale — per-kg storage is lossless for every realistic supplier price; per-gram and per-100g aren't.

```typescript
export const INGREDIENT_BASE_UNITS = ["g", "piece"] as const;
export const INGREDIENT_NUTRITION_SOURCES = ["manual", "ai", "supplier", "seed"] as const;

export const ingredients = pgTable(
  "ingredients",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("ing")),
    name: text("name").notNull().default("Nová surovina"),
    slug: text("slug")
      .notNull()
      .unique()
      .$defaultFn(() => draftSlug("Nová surovina")),

    baseUnit: text("base_unit")
      .$type<(typeof INGREDIENT_BASE_UNITS)[number]>()
      .notNull()
      .default("g"),
    gramsPerPiece: integer("grams_per_piece"),  // required when baseUnit = 'piece'

    // Pricing — exactly one is non-null, enforced by CHECK below
    pricePerKgCents: integer("price_per_kg_cents"),       // when baseUnit = 'g'
    pricePerPieceCents: integer("price_per_piece_cents"), // when baseUnit = 'piece'

    supplierName: text("supplier_name"),

    allergenCodes: text("allergen_codes")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),

    nutritionPer100: jsonb("nutrition_per_100").$type<NutritionPer100>(),
    nutritionSource: text("nutrition_source")
      .$type<(typeof INGREDIENT_NUTRITION_SOURCES)[number]>()
      .notNull()
      .default("manual"),

    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("idx_ingredients_slug").on(t.slug),
    index("idx_ingredients_active").on(t.isActive),
    // Trigram GIN index for fuzzy + duplicate-suggestion queries
    sql`CREATE INDEX idx_ingredients_name_trgm ON ${t} USING gin (lower(unaccent(name)) gin_trgm_ops)`,

    check("ingredients_price_kg_non_negative",   sql`${t.pricePerKgCents} IS NULL OR ${t.pricePerKgCents} >= 0`),
    check("ingredients_price_piece_non_negative", sql`${t.pricePerPieceCents} IS NULL OR ${t.pricePerPieceCents} >= 0`),
    check(
      "ingredients_grams_per_piece_when_piece",
      sql`(${t.baseUnit} <> 'piece') OR (${t.gramsPerPiece} IS NOT NULL AND ${t.gramsPerPiece} > 0)`
    ),
    // Price column XOR: exactly one non-null, matching baseUnit
    check(
      "ingredients_price_matches_base_unit",
      sql`(${t.baseUnit} = 'g'     AND ${t.pricePerKgCents}    IS NOT NULL AND ${t.pricePerPieceCents} IS NULL)
       OR (${t.baseUnit} = 'piece' AND ${t.pricePerPieceCents} IS NOT NULL AND ${t.pricePerKgCents}    IS NULL)`
    ),
  ]
);
```

The trigram index is created via raw SQL because Drizzle's index DSL doesn't express `gin_trgm_ops` cleanly. Other indexes use the standard DSL.

`NutritionPer100` is a TS type:

```typescript
export type NutritionPer100 = {
  kcal: number;
  protein: number;        // g
  fat: number;            // g
  saturatedFat: number;   // g
  carbs: number;          // g
  sugar: number;          // g
  salt: number;           // g
  fiber: number;          // g
};
```

Stored as `jsonb` rather than separate columns to keep the row narrow and let the shape evolve (e.g., adding `vitaminD` later) without migrations. Indexed access is rare; we always read the whole nutrition blob.

The CHECK `ingredients_grams_per_piece_when_piece` enforces the conditional requirement at DB level. The Zod schema validates the same on input.

#### New table: `ingredient_price_history`

Append-only log. One row per price change. Mirrors the same two-column XOR shape as `ingredients` so historical reconstruction needs zero conversion.

```typescript
export const ingredientPriceHistory = pgTable(
  "ingredient_price_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("iph")),
    ingredientId: text("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    // Mirrors the ingredients table's pricing shape
    pricePerKgCents: integer("price_per_kg_cents"),
    pricePerPieceCents: integer("price_per_piece_cents"),
    supplierName: text("supplier_name"),
    source: text("source").default("manual").notNull(),  // 'manual' | 'import' | 'seed' | 'ai'
    notes: text("notes"),
    effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
  },
  (t) => [
    index("idx_iph_ingredient_effective").on(t.ingredientId, t.effectiveFrom),
    check("iph_price_kg_non_negative",    sql`${t.pricePerKgCents}    IS NULL OR ${t.pricePerKgCents}    >= 0`),
    check("iph_price_piece_non_negative", sql`${t.pricePerPieceCents} IS NULL OR ${t.pricePerPieceCents} >= 0`),
    check(
      "iph_price_xor",
      sql`(${t.pricePerKgCents} IS NOT NULL AND ${t.pricePerPieceCents} IS NULL)
       OR (${t.pricePerPieceCents} IS NOT NULL AND ${t.pricePerKgCents}    IS NULL)`
    ),
  ]
);
```

Updates to the ingredient's price are mirrored into this table by the action layer (no DB trigger — keep logic in app code where it's debuggable). **Ordering:** insert the price-history row FIRST, then update the ingredient. If history insert fails, abort the update — the audit log is the safer side to favour.

#### Relations

```typescript
export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  priceHistory: many(ingredientPriceHistory),
  // recipeItems link added in Phase C
}));

export const ingredientPriceHistoryRelations = relations(
  ingredientPriceHistory,
  ({ one }) => ({
    ingredient: one(ingredients, {
      fields: [ingredientPriceHistory.ingredientId],
      references: [ingredients.id],
    }),
  })
);
```

#### Migration steps

1. `pnpm db:generate` — produces the migration.
2. **Manually edit** the generated SQL to append the seed `INSERT` for the bakery ingredients ([seed data](#seed-data)). Each seed row also needs a corresponding `ingredient_price_history` row with `source = 'seed'` and `effectiveFrom = now()`.
3. `pnpm db:migrate`.

---

### 2. Seed data

Approximately 50 common Slovak bakery ingredients. Goal: recipe builder lands with a real catalog of **names + allergens + base unit + grams-per-piece**. Price and nutrition are admin-filled after the seed, not in the seed:

- **Price**: every seed row inserts a placeholder `pricePerKgCents = 0` (or `pricePerPieceCents = 0` for eggs) and a flag/notes "Cena: doplniť". The list page filter "Bez ceny" surfaces them for batch entry.
- **Nutrition**: every seed row has `nutritionPer100 = NULL` and `nutritionSource = 'seed'`. Admin uses the AI autofill flow (this same phase) to populate them one-by-one with confirmation. See [§7 AI nutrition autofill](#7-ai-nutrition-autofill).

This split is deliberate: hardcoding 50 × 8 nutrition values into the migration is hours of brittle copy-paste from public sources. The AI flow takes ~50 clicks and gives admins a confirmation step.

Categories to cover:
- **Múky** (8): T550, T650, T1050, T1800, špaldová, ražná tmavá, ražná svetlá, kukuričná
- **Tekutiny / mlieko** (6): voda, mlieko 1.5%, mlieko 3.5%, smotana 33%, kyslá smotana, cmar
- **Cukry / sladidlá** (5): kryštálový cukor, práškový cukor, hnedý cukor, med, glukózový sirup
- **Tuky** (5): maslo, sadlo, slnečnicový olej, olivový olej, repkový olej
- **Vajcia** (1): vajce M (`baseUnit=piece`, `gramsPerPiece=50`, `allergenCodes=['eggs']`)
- **Soli / koreniny** (5): morská soľ, jemná soľ, mletá rasca, mletý zázvor, vanilkový cukor
- **Kysniace** (4): čerstvé droždie, sušené droždie, prášok do pečiva, sóda bikarbóna
- **Orechy / semienka** (8): vlašské orechy, mandle, lieskovce, slnečnicové semienka, sezamové semienka, ľanové semienka, makové semienka, tekvicové semienka
- **Sušené ovocie** (4): hrozienka, sušené brusnice, sušené marhule, sušené slivky
- **Špeciality** (4): kakaový prášok, čokoláda 70%, mascarpone, syr Niva

Each seed row carries:
- `name`, `slug`
- `baseUnit` + `gramsPerPiece` (only for vajce)
- `allergenCodes` populated from EU 14 mapping (e.g. múka → `['gluten']`, mlieko → `['milk']`, vajce → `['eggs']`, mandle → `['tree_nuts']`)
- `pricePerKgCents = 0` (or `pricePerPieceCents = 0` for eggs) — placeholder
- `nutritionPer100 = NULL`
- `nutritionSource = 'seed'`
- `isActive = true`

Seed lives in a TS file (`drizzle/seed/ingredients.ts`) imported by the migration generator script. Easier to maintain than raw SQL; final SQL is what gets committed.

Each seed row also generates a corresponding `ingredient_price_history` row with the zero price and `source = 'seed'` so future ERP reports see a complete timeline starting from seed-time.

---

### 3. Feature module: `src/features/ingredients/`

```
src/features/ingredients/
├── api/
│   ├── queries.ts
│   └── actions.ts
├── components/
│   ├── ingredient-form.tsx          # used standalone AND inside Phase C's Sheet
│   ├── ingredients-table.tsx
│   ├── ingredient-list-filters.tsx
│   ├── nutrition-fields.tsx
│   ├── price-input.tsx              # unit-aware input with normalization preview
│   ├── price-history-panel.tsx
│   ├── ingredient-status-badge.tsx
│   ├── ai-suggestion-dialog.tsx     # review + confirm AI nutrition suggestion
│   ├── duplicate-suggestion.tsx     # surfaced under the name field at create time
│   └── duplicates-table.tsx         # /admin/ingredients/duplicates tool
├── lib/
│   ├── allergen-defaults.ts         # ingredient-name → allergen heuristics for autofill
│   ├── format.ts                    # formatBaseUnit, formatPricePerUnit, formatPrice100g
│   ├── price-conversion.ts          # admin-input unit → canonical cents/kg or cents/piece
│   └── anthropic.ts                 # singleton SDK client + system prompt constants
└── schema.ts
```

#### `schema.ts` — Zod

```typescript
import { z } from "zod";
import { allergenCodeSchema } from "@/features/allergens/schema";

export const INGREDIENT_BASE_UNITS = ["g", "piece"] as const;

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

export const ingredientSchema = z
  .object({
    name: z.string().trim().min(1, "Názov je povinný").max(100),
    baseUnit: z.enum(INGREDIENT_BASE_UNITS),
    gramsPerPiece: z.number().int().positive().nullable(),
    pricePerKgCents: z.number().int().min(0).nullable(),
    pricePerPieceCents: z.number().int().min(0).nullable(),
    supplierName: z.string().trim().max(100).nullable(),
    allergenCodes: z.array(allergenCodeSchema),
    nutritionPer100: nutritionPer100Schema.nullable(),
    notes: z.string().trim().max(2000).nullable(),
    isActive: z.boolean(),
  })
  .refine(
    (v) => v.baseUnit !== "piece" || (v.gramsPerPiece !== null && v.gramsPerPiece > 0),
    {
      message: "Pri jednotke 'kus' musí byť zadaná hmotnosť za kus",
      path: ["gramsPerPiece"],
    }
  )
  .refine(
    (v) =>
      (v.baseUnit === "g"     && v.pricePerKgCents    !== null && v.pricePerPieceCents === null) ||
      (v.baseUnit === "piece" && v.pricePerPieceCents !== null && v.pricePerKgCents    === null),
    {
      message: "Cena musí byť zadaná v jednotke zodpovedajúcej baseUnit",
      path: ["pricePerKgCents"],
    }
  );

export type IngredientSchema = z.infer<typeof ingredientSchema>;

export const updateIngredientSchema = ingredientSchema.extend({
  id: z.string().min(1),
});

// AI autofill response shape
export const aiNutritionSuggestionSchema = z.object({
  ...nutritionPer100Schema.shape,
  confidence: z.enum(["high", "medium", "low"]),
  source: z.string().max(200),
});

export type AiNutritionSuggestion = z.infer<typeof aiNutritionSuggestionSchema>;
```

#### `api/queries.ts`

All cached with `"use cache"`, `cacheLife("hours")`, tagged `"ingredients"` (and per-id where relevant). See [arc overview §5](./_arc-overview.md#5-cache-tag-matrix).

| Query | Purpose | Cache tags |
|---|---|---|
| `getIngredients(opts?: { search?, isActive?, missingPrice?, missingNutrition? })` | List for admin table; `search` runs trigram match | `ingredients` |
| `getIngredientById(id)` | Detail page + form | `ingredients`, `ingredient-${id}` |
| `getIngredientPriceHistory(id, limit?)` | Last N price changes for the chart | `ingredient-${id}-prices` |
| `getIngredientsForResolver()` | Lightweight Map of active ingredients used by Phase C resolver | `ingredients` |
| `findSimilarIngredients(name, limit?)` | Trigram similarity for duplicate suggestion at create time | `ingredients` |
| `getIngredientDuplicates(threshold?)` | Pairs above similarity threshold for the duplicates review page | `ingredients` |

`getIngredientsForResolver()` is the bridge to Phase C — same idea as `getResolverContext()` over there, but the ingredient half. Returns only the columns the resolver needs (id, name, baseUnit, pricePerKgCents, pricePerPieceCents, allergenCodes, gramsPerPiece, nutritionPer100). Phase C's resolver context query JOINs this with recipes data.

#### Fuzzy / similarity queries

`findSimilarIngredients(name)` runs:

```sql
SELECT id, name, similarity(lower(unaccent(name)), lower(unaccent($1))) AS score
FROM ingredients
WHERE similarity(lower(unaccent(name)), lower(unaccent($1))) > 0.6
ORDER BY score DESC
LIMIT $2;
```

`getIngredients({ search })` runs a trigram match with a lower threshold (0.3) so the admin's typing always returns *something* useful, plus a fallback ILIKE for short queries (1-2 chars) where trigrams are unreliable.

#### `api/actions.ts`

All actions: `"use server"`, `await requireIngredientEdit()`, error-logged via `log.ingredients.error()`, `revalidateTag()` after success. See [arc overview §5](./_arc-overview.md#5-cache-tag-matrix).

| Action | Input | Effect | Tags invalidated |
|---|---|---|---|
| `createIngredientAction` | `IngredientSchema` | Insert price-history row first, then insert ingredient. **Returns the new ingredient** (no redirect) so Phase C's inline-create flow can autofill the picker | `ingredients`, `recipes`, `reports` |
| `updateIngredientAction` | `UpdateIngredientSchema` | If price changed: insert history row FIRST, then update ingredient. Otherwise: just update. | `ingredients`, `ingredient-${id}`; if price changed: `ingredient-${id}-prices`, `recipes`, `reports` |
| `deleteIngredientAction` | `{ id }` | Hard delete only when no recipe items reference it (Phase C check via direct SQL); else returns `{ success: false, error: "Surovina je použitá v X receptoch", recipeIds: [...] }` | `ingredients`, `ingredient-${id}` |
| `setIngredientActiveAction` | `{ id, isActive }` | Soft-deactivate; deactivated ingredients are filtered from Phase C picker but stay readable for old recipes | `ingredients`, `ingredient-${id}` |
| `aiAutofillNutritionAction` | `{ ingredientId }` | Calls Claude API, returns suggestion (no DB write). Admin confirms via dialog; dialog calls `updateIngredientAction` with the values + `nutritionSource: 'ai'` | none (read-only) |

Notable details:

- **`createIngredientAction` deviates from the project pattern of redirecting after create.** Reason: Phase C's recipe builder needs the new ingredient back to update the picker. The standalone "Nová surovina" button on the list page does its own `router.push(/admin/ingredients/${ingredient.id})` after the action returns.
- **Price-history ordering is reversed from the project's typical defensive pattern.** Insert the audit row FIRST, then update the ingredient. If the history insert fails, abort. Rationale: we'd rather have a history row without a current-price update (admin will retry, the change just didn't happen) than a current-price update without history (silent loss of audit trail, only noticed weeks later in reports).
- **`deleteIngredientAction`** only becomes practically useful after Phase C ships; in Phase B alone there's nothing to reference an ingredient, so the recipe-items check is a no-op until then. The check is written defensively from day one to avoid retrofitting.
- **`aiAutofillNutritionAction`** is the suggestion-only call; nothing is persisted until the admin confirms via `<AiSuggestionDialog>`. See [§7](#7-ai-nutrition-autofill).

#### Allergen autofill helper (`lib/allergen-defaults.ts`)

Tiny utility that suggests allergens based on ingredient name keywords:

```typescript
const RULES: Array<{ pattern: RegExp; codes: AllergenCode[] }> = [
  { pattern: /múk[au]|chleb|otrub|pšenic|raž/i, codes: ["gluten"] },
  { pattern: /mlieko|smotan|maslo|jogurt|syr|tvaroh|cmar|mascarpone/i, codes: ["milk"] },
  { pattern: /vajc/i, codes: ["eggs"] },
  { pattern: /mandl[ae]|orech|lieskov|kešu|piniov|para/i, codes: ["tree_nuts"] },
  { pattern: /araši/i, codes: ["peanuts"] },
  { pattern: /sezam/i, codes: ["sesame"] },
  { pattern: /sója|sójov/i, codes: ["soybeans"] },
  { pattern: /horčic/i, codes: ["mustard"] },
  { pattern: /zeler/i, codes: ["celery"] },
  // ...
];

export function suggestAllergens(name: string): AllergenCode[];
```

Wired to the ingredient form: when admin types a name, after debounce, allergen chips light up as suggestions ("Navrhnuté: Lepok"). Admin confirms with a click. Reduces typing for the seed-list and for new entries.

This is a 30-LOC utility, not a magic system. It's cosmetic; the admin can override.

---

### 4a. Price input component

**File:** `src/features/ingredients/components/price-input.tsx`

`"use client"` controlled component. Admin types whatever number the supplier invoice shows; component normalizes to cents/kg (mass) or cents/piece (piece) on each keystroke.

```typescript
type Props = {
  baseUnit: "g" | "piece";
  valueCents: number | null;          // canonical (cents/kg or cents/piece)
  onChange: (cents: number | null) => void;
};
```

Render:

```
Cena                  [4.00]  €  za  [▼ 1 kg          ]
                                       ├ 1 kg          (mass-based only)
                                       ├ 500 g         (mass-based only)
                                       ├ 100 g         (mass-based only)
                                       ├ 1 kus         (piece-based only)
                                       └ 12 kusov      (piece-based only)

Uložené ako: 400 c/kg
```

Conversion via `lib/price-conversion.ts`:

```typescript
// admin sees "4.00 € za 1 kg"
// stored = Math.round(400 * (1000 / 1000)) = 400 cents/kg

// admin sees "4.99 € za 500 g"
// stored = Math.round(499 * (1000 / 500)) = 998 cents/kg

// admin sees "2.40 € za 12 kusov"
// stored = Math.round(240 / 12) = 20 cents/piece
```

The dropdown's unit options switch based on `baseUnit` so the admin can never pick a mass unit for a piece-based ingredient. The "Uložené ako" hint shows the normalized integer live as the admin types so input errors are caught immediately.

When `valueCents` is null (placeholder / "Cena: doplniť"), the input shows empty + a red helper "Cena nie je zadaná".

### 4b. Duplicate detection at create time

**File:** `src/features/ingredients/components/duplicate-suggestion.tsx`

`"use client"` controlled component, rendered under the name field on the create form (not the edit form).

Behavior:
- Debounce 300 ms after admin stops typing
- Call `findSimilarIngredients(name)` via a server action wrapper
- If results: render a row of clickable suggestion chips: "Možno máte na mysli: **Hladká múka T650** · **Polohrubá múka** · ... — klik pre vybranie"
- Click → close the create dialog and navigate to the existing ingredient's edit page
- If admin proceeds anyway (clicks Save), the create runs. No hard block.

This is the cheapest, highest-impact duplicate-prevention feature. ~50 LOC of UI + 1 query.

### 4c. Duplicates review tool

**Route:** `/admin/ingredients/duplicates`

`src/app/(admin)/admin/ingredients/duplicates/page.tsx`

Server component, `requireIngredientEdit()`. Lists pairs of ingredients above a similarity threshold (default 0.7) with:
- Both names + IDs
- Similarity score
- Created-at deltas
- Click-through to edit each side
- No automated merge (would require recipe-item retargeting; do that by hand)

Pure diagnostic. Linked from the ingredients list page header: `[Duplicity (3)]` badge when any pairs exist.

### 5. Routes

#### `/admin/ingredients` — list page

`src/app/(admin)/admin/ingredients/page.tsx`

Server component. `requireStaff()` guard at the top.

Layout:
- Header: title, `[+ Nová surovina]` button (calls `createIngredientAction` then redirects)
- Filter row: search input (name), `isActive` toggle, "Bez ceny" filter (price = 0)
- Table: name, baseUnit chip (g / ks), price per unit, allergens chips, active state, updatedAt, actions menu
- Pagination: server-side, 50 per page (cursor or offset — match existing patterns)

Reuses the `ColumnHeader` / `DataTable` patterns from existing admin tables (e.g. orders, products).

#### `/admin/ingredients/[id]` — detail / edit page

`src/app/(admin)/admin/ingredients/[id]/page.tsx`

Server component, loads ingredient + price history in parallel, `requireStaff()`, 404 if missing.

Renders:
- `<IngredientForm>` (the same component used in Phase C's inline Sheet)
- `<PriceHistoryPanel>` — last 20 price changes as a list with mini sparkline (the `tremor` or shadcn chart primitive — pick one or roll a tiny SVG; sparkline is nice-to-have, list is required)
- `[Vymazať surovinu]` button with confirm dialog → `deleteIngredientAction`. If it returns the "used in N recipes" error, dialog stays open and shows the offending recipe list with links.

#### Admin nav

`src/app/(admin)/admin/_components/sidebar.tsx` — add "Suroviny" entry.

---

### 6. Ingredient form component

**File:** `src/features/ingredients/components/ingredient-form.tsx`

`"use client"`, RHF + Zod resolver. **Designed to work in two contexts:**

1. **Standalone page** (`/admin/ingredients/[id]`): full-width layout, save button at the bottom, also exposes Delete + Active toggle
2. **Sheet from Phase C recipe builder**: compact layout, save closes sheet, no delete button, ingredient is created in `isActive: true` state

Public API:

```typescript
type Props = {
  initial?: IngredientWithRelations;        // undefined = create mode
  allergens: Allergen[];                     // from getAllergens()
  variant?: "page" | "sheet";                // layout switch
  onSaved?: (ingredient: Ingredient) => void;  // sheet uses this to feed picker
};
```

Sections in render order:
1. **Základné údaje** — name, slug (auto from name, editable), supplierName, notes
2. **Jednotka a cena** — baseUnit radio (`g` / `kus`), gramsPerPiece (shown only when baseUnit=piece), `<PriceInput>` (admin-unit-aware, normalizes to `pricePerKgCents` or `pricePerPieceCents` on save — see §4a)
3. **Alergény** — `<AllergenPicker>` from Phase A, with `<SuggestedAllergens>` chip row above it (driven by `suggestAllergens(name)`)
4. **Nutričné hodnoty (na 100 g)** — `<NutritionFields>` with the 8 fields, plus `nutritionSource` badge (read-only) and a `[Vyplniť pomocou AI]` button (disabled with tooltip "Pripravované" — the action stub is created here for Phase D-or-later)

Validation messages in Slovak. Save handler calls `createIngredientAction` or `updateIngredientAction` depending on mode.

Slug field reuses the existing slug auto-generation pattern from products / categories (`draftSlug`, edit-on-blur, uniqueness check on action side).

---

### 7. AI nutrition autofill

Originally scheduled for Phase D; moved here because nutrition data entry is the largest blocker on Phase C usefulness, and an admin-confirmed AI flow collapses it from "hours of typing across 50 ingredients" to "50 click-and-confirm cycles".

#### New dependency

```
pnpm add @anthropic-ai/sdk
```

#### Singleton client

**File:** `src/features/ingredients/lib/anthropic.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export const NUTRITION_SYSTEM_PROMPT = `Si nutričný odborník pre slovenskú pekáreň. Pre danú surovinu vráť presné nutričné hodnoty na 100 g vo formáte JSON.

Hodnoty musia byť v základnej forme (suchá múka, surové vajce, atď.).
Použi oficiálne zdroje: USDA FoodData Central, slovenské tabuľky zloženia potravín.
Ak si nie si istý hodnotou, vráť 0 a "confidence": "low".

Vráť výhradne JSON v presnom formáte:
{ "kcal": number, "protein": number, "fat": number, "saturatedFat": number, "carbs": number, "sugar": number, "salt": number, "fiber": number, "confidence": "high" | "medium" | "low", "source": string }`;
```

The system prompt is wrapped in a `cache_control: { type: "ephemeral" }` block when sent so subsequent calls reuse the cached tokens. ~600 input tokens per call; cache hits drop that to negligible.

#### Action

`aiAutofillNutritionAction({ ingredientId })`:
1. `requireIngredientEdit()`
2. Load ingredient (need name + supplierName for the prompt)
3. If `anthropic === null` (no API key), return `{ success: false, error: "AI nie je nakonfigurované" }`
4. Call `claude-sonnet-4-5` with `max_tokens: 512`, system prompt cached
5. Parse response JSON via `aiNutritionSuggestionSchema`
6. Return `{ success: true, suggestion }` — **no DB write**
7. On any failure: log error, return `{ success: false, error: "AI volanie zlyhalo" }`

Prompt body (user message):
```
Surovina: {ingredient.name}{supplierName ? ` (${supplierName})` : ''}
Jednotka: {baseUnit === 'g' ? '100 g' : `1 kus = ${gramsPerPiece} g, hodnoty na 100 g`}
```

#### Confirmation dialog

**File:** `src/features/ingredients/components/ai-suggestion-dialog.tsx`

`<AlertDialog>` opened by the `[Vyplniť pomocou AI]` button on the form. Shows:
- 8 nutrition values side-by-side: current value (if any) vs AI suggestion, color-coded for changes
- Confidence chip (`high` / `medium` / `low`)
- Source line ("Podľa: USDA FoodData Central")
- `[Použiť hodnoty]` / `[Zrušiť]`

`[Použiť hodnoty]` applies the suggestion via `updateIngredientAction` with `nutritionSource: 'ai'`. Cancel just closes.

#### Cost & rate limits

Per call: ~600 input + ~200 output tokens. With prompt caching the system block is reused. Roughly fractions of a cent per ingredient. The full 50-ingredient catalog: well under €1 one-time. No rate limiting needed.

#### Failure modes

- **API key missing:** button disabled, tooltip "AI funkcia nie je nakonfigurované".
- **API call fails (network, quota, etc.):** toast with Slovak error, no DB write, log the error.
- **API returns malformed JSON:** Zod parse fails, error toast, no DB write.
- **Low confidence:** dialog still opens, admin decides.

---

### 8. Logging

`src/lib/logger.ts` — the `ingredients` namespace was added in pre-A scaffolding. Phase B uses it for:
- `log.ingredients.error()` — failed actions, AI errors
- `log.ingredients.warn()` — price-history append failures
- `log.ingredients.info()` — AI autofill success/usage tracking

---

### 9. Documentation updates

- `docs/database-schema.md` — document `ingredients` and `ingredient_price_history` tables
- `docs/features-catalog.json` — new `ingredients` feature entry, update `lastUpdated`
- `CLAUDE.md` (project) — mention ingredient catalog under Architecture / Feature Modules. One-line addition.

---

## File summary

| Action | File |
|---|---|
| Edit | `src/db/schema.ts` — `ingredients`, `ingredient_price_history`, relations (**human approval**) |
| Generate | `drizzle/NNNN_ingredients.sql` migration — includes `CREATE EXTENSION pg_trgm`, `CREATE EXTENSION unaccent`, trigram GIN index, seed `INSERT`s |
| Create | `drizzle/seed/ingredients.ts` — bakery ingredient seed source (TS, used to author the SQL block) |
| Create | `src/features/ingredients/schema.ts` |
| Create | `src/features/ingredients/api/queries.ts` |
| Create | `src/features/ingredients/api/actions.ts` |
| Create | `src/features/ingredients/lib/allergen-defaults.ts` |
| Create | `src/features/ingredients/lib/format.ts` — `formatBaseUnit`, `formatPricePerUnit` (shows "4,00 €/kg (0,40 €/100g)"), `formatPrice100g` |
| Create | `src/features/ingredients/lib/price-conversion.ts` — admin-input unit → canonical cents/kg / cents/piece |
| Create | `src/features/ingredients/lib/anthropic.ts` — singleton SDK client + system prompt |
| Create | `src/features/ingredients/components/ingredient-form.tsx` |
| Create | `src/features/ingredients/components/ingredients-table.tsx` |
| Create | `src/features/ingredients/components/ingredient-list-filters.tsx` |
| Create | `src/features/ingredients/components/nutrition-fields.tsx` |
| Create | `src/features/ingredients/components/price-input.tsx` |
| Create | `src/features/ingredients/components/price-history-panel.tsx` |
| Create | `src/features/ingredients/components/ingredient-status-badge.tsx` |
| Create | `src/features/ingredients/components/ai-suggestion-dialog.tsx` |
| Create | `src/features/ingredients/components/duplicate-suggestion.tsx` |
| Create | `src/features/ingredients/components/duplicates-table.tsx` |
| Create | `src/app/(admin)/admin/ingredients/page.tsx` |
| Create | `src/app/(admin)/admin/ingredients/[id]/page.tsx` |
| Create | `src/app/(admin)/admin/ingredients/duplicates/page.tsx` |
| Edit | `src/app/(admin)/admin/_components/sidebar.tsx` — "Suroviny" nav entry |
| Edit | `.env.example` — add `ANTHROPIC_API_KEY` |
| Edit | `docs/database-schema.md` — document new tables + extensions |
| Edit | `docs/features-catalog.json` — add `ingredients` feature, update `lastUpdated` |
| Edit | `CLAUDE.md` — one-line addition to feature module list |
| Add dep | `@anthropic-ai/sdk` |

---

## Constraints (from `CLAUDE.md`)

- **No `db.transaction()`** — sequential writes. Price-history append goes BEFORE the ingredient update so an audit-log gap is the worst-case failure (not a silent price change).
- **No barrel files** — direct imports.
- **No dynamic imports of internal modules.** Anthropic SDK is third-party, static import is fine.
- **Slovak language** for user-facing text; code in English.
- **`requireIngredientEdit()`** on every action and admin page (admin + manager). Resource-scoped guard from pre-A scaffolding.
- **Schema changes require human approval** before editing `src/db/schema.ts`.
- **No `pnpm db:push`** — generate + migrate.
- **Prices in cents** (integer) throughout. See [arc overview §3](./_arc-overview.md#3-pricing-model-canonical) for the canonical model. `formatPricePerUnit()` only at render boundary.
- **Structured logging** via `log.ingredients.error()` / `log.ingredients.warn()`.
- **`cacheLife("hours")` + `cacheTag()`** on all queries; `revalidateTag()` after mutations. See [arc overview §5](./_arc-overview.md#5-cache-tag-matrix).
- **Anthropic SDK uses prompt caching** on the system prompt (per `claude-api` skill convention).

---

## Open questions / design notes

1. **Soft-delete vs hard-delete.** Going with hard-delete blocked by recipe-item references. Alternative: always soft-delete (set `isActive=false`, keep row forever). Hard-delete is cleaner but may cause grief if an ingredient gets accidentally removed and then needs to come back with the same id. Mitigation: the deletion UI requires typing the ingredient name to confirm. Soft-delete is also available via the `isActive` toggle; admins should reach for that 95% of the time.

2. **Price history granularity.** Currently appends a row only when the price (`pricePerKgCents` or `pricePerPieceCents`) changes. Could also append on supplier change. Skipping that — supplier name is loosely-coupled metadata, history table tracks cost only. If supplier-attribution becomes important, add later.

3. **Currency.** EUR only, hardcoded. No multi-currency. Slovak bakery, no plans to expand. If we ever do, that's a project-wide change, not an ingredient concern.

4. **AI nutrition autofill button.** Wired to a stub action `aiAutofillNutritionAction` that returns `{ success: false, error: "Pripravované" }`. Phase D-or-later replaces the body with a Claude/Gemini call. Stub is shown disabled with tooltip; presence sets the hook for the future feature without blocking Phase B.

5. **Bulk import / CSV.** Out of scope. Manual entry for the 50 seed ingredients + admin entry for new ones is enough at the team's scale. Revisit if catalog grows past ~500.

6. **Density (`gramsPerMl`) field.** Confirmed dropped — base unit is `g` or `piece`, never `ml`. If admin imports a recipe written in ml, they convert at entry time (200 ml mlieka → 200 g, water density). Documented in admin help text on the form.

7. **Multi-language ingredient names.** Slovak only, single `name` column. Matches existing convention (products, categories all use a single Slovak name).

---

## Acceptance criteria

- [ ] Schema migration runs cleanly; pg_trgm and unaccent extensions installed; trigram GIN index present
- [ ] Seed produces 50 ingredients with placeholder prices and NULL nutrition
- [ ] Each seed ingredient has a corresponding `ingredient_price_history` row with `source = 'seed'`
- [ ] Admin can create, edit, fuzzy-search ("muka" finds "Hladká múka T650"), and soft-deactivate ingredients
- [ ] Selecting `baseUnit = piece` reveals and requires the `gramsPerPiece` field; pricing input switches to piece-based units
- [ ] `<PriceInput>` normalization preview ("Uložené ako: 400 c/kg") updates as admin types and changes unit dropdown
- [ ] CHECK constraint blocks saving an ingredient with both `pricePerKgCents` and `pricePerPieceCents` set
- [ ] Updating the price inserts a `ingredient_price_history` row BEFORE updating the ingredient; price chart reflects the change
- [ ] Ingredient list filter "Bez ceny" surfaces all rows with `pricePerKgCents = 0` (or `pricePerPieceCents = 0`)
- [ ] Suggested allergens chip row lights up based on the ingredient name
- [ ] Duplicate suggestion appears under the name field at create time when similarity > 0.6
- [ ] `/admin/ingredients/duplicates` lists pairs above the threshold
- [ ] `<IngredientForm>` works correctly in both `variant="page"` and `variant="sheet"` (unit test the form contract)
- [ ] `[Vyplniť pomocou AI]` button opens dialog with a suggestion + confidence + source; admin confirms persists with `nutritionSource = 'ai'`
- [ ] AI button disabled with tooltip when `ANTHROPIC_API_KEY` is missing
- [ ] Failed AI call surfaces a Slovak error toast and writes no data
- [ ] All actions guarded by `requireIngredientEdit()`; non-staff get 403
- [ ] Hard-delete blocked when (future) recipe items reference the ingredient (no-op until Phase C; defensive code present)
- [ ] No barrel files; no dynamic imports of internal modules
- [ ] All queries cached with `cacheLife("hours")` and tags; mutations invalidate per the [tag matrix](./_arc-overview.md#5-cache-tag-matrix)

---

## Out of scope (Phase D / E / future)

- Phase D: nutrition computation in recipe resolver, PDP nutrition table (AI autofill body moved into Phase B above)
- Phase E: ERP cost reports using `ingredient_price_history`
- Multi-supplier price comparison
- Inventory tracking (stock, expiry, reorder)
- Bulk CSV import / supplier feed integration
- Vector embeddings for ingredient semantic search (pg_trgm covers it; vectors live in [arc overview §9](./_arc-overview.md#9-fuzzy-search--duplicate-detection) as a future option for recipe similarity only)
- Automated duplicate merge (the cleanup tool is review-only)
- Public-facing display of any ingredient data
