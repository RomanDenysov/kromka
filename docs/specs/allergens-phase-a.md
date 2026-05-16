# Allergens (Phase A) — Implementation Spec

> **Read first:** [`_arc-overview.md`](./_arc-overview.md) for cross-cutting decisions (role guards, cache tags, pricing model, mobile, rollback).

## Overview

Add EU 14-allergen support to products. Admin tags each product with the allergens it contains via a chip picker; PDP renders the allergens as labelled chips with Slovak names. No ingredients or recipes yet — Phase A is a standalone, customer-facing slice that delivers EU 1169/2011 compliance and answers the most-asked customer question.

Phase A is **manual tagging**. In Phase D, allergens for products **with a recipe** become derived from the recipe's ingredients. The manual `allergenCodes` column stays in place as the **fallback for products without a recipe** (resold packaged items, simple drinks, etc.). The picker UI becomes conditionally read-only in Phase D when a recipe is linked. See [Migration path to Phase D](#migration-path-to-phase-d).

## Phase A also ships the pre-A scaffolding

Per [`_arc-overview.md` §2](./_arc-overview.md#2-pre-a-scaffolding-do-this-once), the following items ship as part of Phase A's PR to avoid touching the same files 2-3 times across phases:

- **`order_items.unitCostCents` column** (nullable integer) — added to the migration alongside the allergens table. Not populated until Phase C; the column existing now means orders created between A and C aren't permanently cost-blind.
- **Product detail tab structure** — wrap the existing single-column form in shadcn `<Tabs>` with **Info** | **Recenzie**. URL `?tab=info|recenzie`. Future phases extend (Phase C adds "Recept" tab).
- **Role-guard split** — add `requireProductEdit`, `requireRecipeView`, `requireRecipeEdit`, `requireCostView`, `requireIngredientEdit`, `requireReportsView` to `src/lib/auth/guards.ts`. Phase A uses `requireProductEdit` for the new action.
- **Module loggers** — add `ingredients`, `recipes`, `nutrition`, `reports` namespaces to `src/lib/logger.ts` (used by future phases; declared here once).

## Goals

- Admin can tag any product with zero or more EU 14 allergens.
- PDP renders the allergens as readable Slovak chips with icons (e.g. "Lepok", "Vajcia", "Mlieko").
- Reference data (the 14 allergens) is seeded once and cached aggressively — it never changes.
- Zero coupling to ingredients/recipes — Phases B-D can be built independently.

## Non-goals

- "May contain traces" / cross-contamination warnings. **Explicitly excluded.**
- Allergen-based filtering on the e-shop listing page. (Possible Phase D add-on.)
- Any override layer (manual additions or exclusions on top of derived data). Phase D switches the data source for products *with* a recipe; the manual column remains for products *without* a recipe.
- B2B-format printable EU labels.

---

## Current state

### Schema reference points
- [products](../../src/db/schema.ts) (line 801) — existing table. Will gain one column.
- No allergen-related tables, columns, or features exist yet.

### Existing product queries
- `src/features/products/api/queries.ts`
  - `getProductBySlug(slug)` — public PDP query, cached with tag `products`
  - `getAdminProductById(id)` — admin edit form query
  - Both will need to return `allergenCodes`.

### Existing PDP
- `src/app/(public)/(pages)/product/[slug]/page.tsx` — server component, renders price, stock, description. We insert the allergen section between the description and `AddWithQuantityButton` (around line 279).

### Existing admin product form
- `src/app/(admin)/admin/products/[id]/_components/product-form.tsx` — `"use client"`, RHF + Zod, calls `updateProductAction`. Picker becomes a new field in this form.

---

## What to build

### 1. Schema changes

**File:** `src/db/schema.ts` — **REQUIRES HUMAN APPROVAL** before edit.

#### New table: `allergens`

Reference table. `code` is the primary key (text), no prefixed CUID — codes are stable EU identifiers. 14 rows, seeded once.

```typescript
export const allergens = pgTable("allergens", {
  code: text("code").primaryKey(),       // 'gluten', 'eggs', 'milk', ...
  nameSk: text("name_sk").notNull(),     // 'Lepok', 'Vajcia', 'Mlieko', ...
  nameEn: text("name_en").notNull(),     // 'Gluten', 'Eggs', 'Milk', ...
  sortOrder: integer("sort_order").notNull().default(0),
});
```

No relations needed in Phase A — `allergenCodes` on products is a `text[]`, looked up against this table at the application layer.

#### New column on `products`

```typescript
allergenCodes: text("allergen_codes")
  .array()
  .notNull()
  .default(sql`ARRAY[]::text[]`),
```

App-level validation (Zod) enforces that every code exists in the seeded `allergens` table. No FK constraint on array elements (PG limitation).

#### New column on `order_items` (pre-A scaffolding)

```typescript
unitCostCents: integer("unit_cost_cents"),   // nullable; populated by Phase C
```

Phase A doesn't write or read this column. It exists so orders created between Phase A and Phase C aren't permanently cost-blind once Phase C ships.

#### Migration

1. `pnpm db:generate` — produces the schema migration (allergens table, `products.allergenCodes`, `order_items.unitCostCents`).
2. **Manually edit** the generated SQL file to append the seed `INSERT` for the 14 allergens (see [seed data](#seed-data) below).
3. `pnpm db:migrate`.

The seed must live in the migration, not in app code, because the `allergens` table is referenced as a stable enum. A startup-time seeder would race with app code that assumes the rows exist.

### Seed data

The 14 mandatory allergens from EU Regulation 1169/2011 Annex II, with Slovak names:

| code | nameSk | nameEn | sortOrder |
|---|---|---|---|
| `gluten` | Lepok | Gluten | 10 |
| `crustaceans` | Kôrovce | Crustaceans | 20 |
| `eggs` | Vajcia | Eggs | 30 |
| `fish` | Ryby | Fish | 40 |
| `peanuts` | Arašidy | Peanuts | 50 |
| `soybeans` | Sójové bôby | Soybeans | 60 |
| `milk` | Mlieko | Milk | 70 |
| `tree_nuts` | Orechy | Tree nuts | 80 |
| `celery` | Zeler | Celery | 90 |
| `mustard` | Horčica | Mustard | 100 |
| `sesame` | Sezam | Sesame | 110 |
| `sulphites` | Oxid siričitý a siričitany | Sulphites | 120 |
| `lupin` | Vlčí bôb | Lupin | 130 |
| `molluscs` | Mäkkýše | Molluscs | 140 |

`sortOrder` follows the EU's official ordering and is used as the canonical render order on PDP and in the picker.

### 2. Feature module: `src/features/allergens/`

New feature folder. Standard layout:

```
src/features/allergens/
├── api/
│   ├── queries.ts
│   └── actions.ts
├── components/
│   ├── allergen-picker.tsx     # admin
│   └── allergen-list.tsx        # public PDP
├── lib/
│   └── icons.ts                 # code → lucide icon
└── schema.ts
```

#### `schema.ts`

```typescript
import { z } from "zod";

export const ALLERGEN_CODES = [
  "gluten", "crustaceans", "eggs", "fish", "peanuts", "soybeans",
  "milk", "tree_nuts", "celery", "mustard", "sesame", "sulphites",
  "lupin", "molluscs",
] as const;

export const allergenCodeSchema = z.enum(ALLERGEN_CODES);
export type AllergenCode = z.infer<typeof allergenCodeSchema>;

export const updateProductAllergensSchema = z.object({
  productId: z.string().min(1),
  codes: z.array(allergenCodeSchema),
});

export type UpdateProductAllergensSchema = z.infer<typeof updateProductAllergensSchema>;
```

Hardcoding the 14 codes in TS gives us:
- Compile-time `AllergenCode` type for the picker, list, and icons map.
- Zod validation without round-tripping the DB.
- Single source of truth that matches the migration seed.

The DB row count is the runtime counterpart. If the two ever drift, a CI check (`SELECT count(*) FROM allergens` vs. `ALLERGEN_CODES.length`) flags it.

#### `api/queries.ts`

```typescript
"use cache";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { allergens } from "@/db/schema";

export async function getAllergens() {
  cacheLife("max");          // never changes after seed
  cacheTag("allergens");
  return db.query.allergens.findMany({
    orderBy: (a, { asc }) => asc(a.sortOrder),
  });
}

export type Allergen = Awaited<ReturnType<typeof getAllergens>>[number];
```

Cache life `"max"` because the seed never changes. If we ever localize beyond Slovak/English, we'd invalidate manually.

#### `api/actions.ts`

```typescript
"use server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";
import {
  updateProductAllergensSchema,
  type UpdateProductAllergensSchema,
} from "../schema";

export async function updateProductAllergensAction(
  input: UpdateProductAllergensSchema
) {
  await requireAdmin();
  const parsed = updateProductAllergensSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" } as const;
  }

  try {
    // De-dupe + sort by ALLERGEN_CODES order for canonical storage
    const codes = [...new Set(parsed.data.codes)];
    await db
      .update(products)
      .set({ allergenCodes: codes })
      .where(eq(products.id, parsed.data.productId));

    revalidateTag("products");
    return { success: true } as const;
  } catch (err) {
    log.products.error(
      { err, productId: parsed.data.productId },
      "Update product allergens failed"
    );
    return { success: false, error: "Uloženie zlyhalo" } as const;
  }
}
```

**Note:** Cache invalidation tag is `products` (existing). We do not add a new per-product tag — Phase A keeps it simple. If perf shows whole-catalog invalidation is too aggressive, narrow later.

#### `lib/icons.ts`

Static mapping. Lucide icons are not perfect for food allergens but cover most cases; remaining use a generic `<Circle />` placeholder. The icon set is part of the Slovak-bakery brand call later — for Phase A, ship lucide and iterate.

```typescript
import {
  Wheat, Shell, Egg, Fish, Nut, Sprout, Milk, TreePine,
  Leaf, Flame, Dot, FlaskConical, Bean, Shell as Mollusc,
  type LucideIcon,
} from "lucide-react";
import type { AllergenCode } from "../schema";

export const ALLERGEN_ICONS: Record<AllergenCode, LucideIcon> = {
  gluten: Wheat,
  crustaceans: Shell,
  eggs: Egg,
  fish: Fish,
  peanuts: Nut,
  soybeans: Sprout,
  milk: Milk,
  tree_nuts: TreePine,
  celery: Leaf,
  mustard: Flame,
  sesame: Dot,
  sulphites: FlaskConical,
  lupin: Bean,
  molluscs: Mollusc,
};
```

#### `components/allergen-picker.tsx` (admin)

`"use client"` chip-toggle picker. Renders one chip per allergen from `getAllergens()` (passed in as a prop from the server form container). Toggling a chip updates an internal state; on submit, the parent form calls `updateProductAllergensAction`.

API:
```typescript
type Props = {
  allergens: Allergen[];           // from getAllergens()
  value: AllergenCode[];           // currently selected codes
  onChange: (codes: AllergenCode[]) => void;
};
```

Render:
- Grid of chips (`<Toggle>` from shadcn or custom button with `data-state`)
- Each chip: lucide icon + `nameSk`
- Selected chip: filled variant; unselected: outline
- Sorted by `sortOrder` (already done by query)

This is a pure controlled component — does not call the action directly. Keeps it composable inside the existing RHF product form.

#### `components/allergen-list.tsx` (public PDP)

Server component. Takes the product's `allergenCodes` and the full `allergens` array; renders a horizontal list of chips with icon + Slovak name. Returns `null` if list is empty (no "obsahuje: žiadne alergény" placeholder — silence is the right UX).

```typescript
type Props = {
  codes: AllergenCode[];
  allergens: Allergen[];
};
```

Markup is a section with heading "Alergény" and a `flex flex-wrap gap-2` row of `<Badge variant="secondary">` items, each with `<Icon className="size-4" />` + name.

### 3. Update existing product queries

**File:** `src/features/products/api/queries.ts`

Both `getProductBySlug` and `getAdminProductById` already select `*` from products via Drizzle's `findFirst`. Adding `allergenCodes` to the schema means it flows through automatically. Verify by inspecting return types after the schema migration; no code change should be needed beyond TypeScript catching new field availability.

If either query uses a column-list projection, append `allergenCodes` explicitly.

### 4. Wire admin form

**File:** `src/app/(admin)/admin/products/[id]/_components/product-form.tsx`

This file gets two changes in one PR: the tab restructure (pre-A scaffolding) **and** the allergen picker.

**Tab restructure first.** Wrap the existing form content in shadcn `<Tabs>`:
- `?tab=info` (default) — contains everything currently in the form, including the new allergen picker
- `?tab=recenzie` — existing reviews section (move from wherever it currently lives)

Tab state lives in URL search params; reads are server-side. This is plumbing only — no behaviour changes beyond the visual tab strip.

**Then add the picker** as a new RHF-controlled field inside the Info tab:

1. Extend the form's Zod schema to include `allergenCodes: z.array(allergenCodeSchema)`.
2. Pass `allergens` (from a server-side `getAllergens()` call in the parent page) into the form as a prop.
3. Render `<AllergenPicker>` inside the existing form layout — likely a new section between "Description" and "Pricing".

> **Note for Phase D:** the picker becomes conditionally read-only when a recipe is linked to the product. In Phase A, it's always editable. The Phase D edit is a single conditional render, no structural change.
4. The existing submit handler (`updateProductAction`) needs to accept `allergenCodes`. Two options:
   - **Option A (preferred):** Add `allergenCodes` to `updateProductSchema` in `src/features/products/schema.ts` and let the existing `updateProductAction` write it. One round-trip.
   - **Option B:** Call `updateProductAllergensAction` separately after `updateProductAction`. Two round-trips, awkward error handling. Avoid.

Going with **Option A** — `updateProductAllergensAction` then becomes redundant for the form path and is only useful for future programmatic callers. We keep it for cleanliness but the admin form does not use it. Re-evaluate if it remains unused at the end of the implementation.

**Schema update:**
```typescript
// src/features/products/schema.ts
import { allergenCodeSchema } from "@/features/allergens/schema";

export const updateProductSchema = z.object({
  ...productSchema.shape,
  categoryId: z.string().nullable(),
  imageId: z.string().nullable(),
  allergenCodes: z.array(allergenCodeSchema),   // new
});
```

**Action update** (`src/features/products/api/actions.ts:updateProductAction`):
- Persist `allergenCodes` alongside other fields in the same `db.update().set({...})` call.
- No new cache tag needed; existing `updateTag("products")` covers PDP.

### 5. Wire PDP

**File:** `src/app/(public)/(pages)/product/[slug]/page.tsx`

1. Fetch allergens reference list alongside the product (parallel):
   ```typescript
   const [result, allAllergens] = await Promise.all([
     getProductBySlug(slug),
     getAllergens(),
   ]);
   ```
2. Insert `<AllergenList codes={result.allergenCodes} allergens={allAllergens} />` between the description block (line 277) and the `<Separator />` before `AddWithQuantityButton` (line 279).

The component returns `null` for empty arrays so unset products render unchanged.

### 6. JSON-LD update (nice-to-have)

The PDP already emits JSON-LD product structured data (around line 150). [Schema.org/Product](https://schema.org/Product) does not have a first-class allergen field, but [Schema.org/NutritionInformation](https://schema.org/NutritionInformation) is in scope for Phase D. **Skip for Phase A.** Note in the Phase D spec.

---

## File summary

| Action | File |
|---|---|
| Edit | `src/db/schema.ts` — `allergens` table, `products.allergenCodes`, `order_items.unitCostCents` (**human approval required**) |
| Create | `drizzle/NNNN_allergens.sql` — migration, manually append seed `INSERT`s |
| Create | `src/features/allergens/schema.ts` |
| Create | `src/features/allergens/api/queries.ts` |
| Create | `src/features/allergens/api/actions.ts` |
| Create | `src/features/allergens/lib/icons.ts` |
| Create | `src/features/allergens/components/allergen-picker.tsx` |
| Create | `src/features/allergens/components/allergen-list.tsx` |
| Edit | `src/features/products/schema.ts` — add `allergenCodes` to `updateProductSchema` |
| Edit | `src/features/products/api/actions.ts` — persist `allergenCodes` in `updateProductAction` |
| Verify | `src/features/products/api/queries.ts` — `allergenCodes` flows through (no change expected) |
| Edit | `src/app/(admin)/admin/products/[id]/_components/product-form.tsx` — wrap in `<Tabs>`, render `<AllergenPicker>` in Info tab |
| Edit | `src/app/(admin)/admin/products/[id]/page.tsx` — pass `allergens` from `getAllergens()`, read `?tab=` |
| Edit | `src/app/(public)/(pages)/product/[slug]/page.tsx` — render `<AllergenList>` |
| Edit (pre-A) | `src/lib/auth/guards.ts` — add resource-scoped guards (`requireProductEdit`, `requireRecipeView`, `requireRecipeEdit`, `requireCostView`, `requireIngredientEdit`, `requireReportsView`) |
| Edit (pre-A) | `src/lib/logger.ts` — add `ingredients`, `recipes`, `nutrition`, `reports` namespaces |
| Edit | `docs/features-catalog.json` — add `allergens` feature entry, update `lastUpdated` |
| Edit | `docs/database-schema.md` — document new table + columns |

---

## Constraints (from `CLAUDE.md`)

- **No `db.transaction()`** — Phase A has only single-table writes, no constraint hit.
- **No barrel files** — direct imports from each file path.
- **No dynamic imports of internal modules.**
- **Slovak language for user-facing text.**
- **`requireProductEdit()` on the new server action** (admin + manager). Use the resource-scoped guards from pre-A scaffolding.
- **`updateTag("products")` after the action.** See [arc overview cache tag matrix](./_arc-overview.md#5-cache-tag-matrix).
- **Structured logging via `log.products.error()`.**
- **Schema changes require human approval before editing `src/db/schema.ts`.**
- **No `pnpm db:push`** — generate + migrate.

---

## Migration path to Phase D

When Phase D ships ingredient-driven derivation:

1. Phase D extends the Phase C resolver to derive allergens (`recipe → ingredient[] → allergenCodes`).
2. A new query `getDerivedProductDisplay(productId)` returns derived allergens when the product has a recipe; otherwise falls back to the manual `allergenCodes` column.
3. The `<AllergenList>` PDP component stays unchanged — only its upstream data source changes.
4. The admin picker becomes **conditionally read-only** when a recipe is linked, with a banner pointing at the recipe. Editable for products without a recipe.
5. A drift report at `/admin/recipes/drift` lists products where the manual list differs from the derived list — read-only diagnostic for the migration.

**Important:** `products.allergenCodes` is **NOT dropped in Phase D**. It stays as the manual fallback for products without a recipe (resold packaged items, drinks, etc.). The column never goes away.

---

## Open questions for review

1. **Icon set.** Lucide gives us "good enough" mappings for 10 of 14, but "sulphites", "sesame", and "molluscs" are stretched. Worth replacing with custom SVGs from a Slovak-bakery designer later, or sticking with lucide indefinitely?
2. **Should the picker live in a tab or inline?** Current product form is a long single column. A new section is fine inline, but if the form is approaching scrollability limits we may want tabs (Info / Allergens / Pricing / Images).
3. **Cache tag granularity.** Phase A invalidates the whole `products` tag on any allergen edit. Acceptable (allergen edits are rare). Per-slug tag (`product-{slug}`) only worth adding if Phase D + heavier traffic justifies it.
4. **B2B PDP.** Confirming the same `<AllergenList>` renders unchanged on the B2B catalog product views, no separate path needed.

None of these block implementation. They become decisions during the build.
