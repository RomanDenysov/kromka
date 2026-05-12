# Recipes & Computed Cost (Phase C) — Implementation Spec

> **Read first:** [`_arc-overview.md`](./_arc-overview.md) for the canonical pricing model, role guards, cache tags, and pre-A scaffolding (which already added `order_items.unitCostCents` and the product page tab structure).

## Overview

Add a recipe system on top of the ingredient catalog (delivered in Phase B). Each product can be linked to a recipe; recipes are made of ingredients and/or sub-recipes. The admin gets a spreadsheet-style recipe builder with live cost preview, recipe duplication for fast iteration, and an ingredient picker that supports both single-item selection and bulk-pull from another recipe.

Production cost is written into the `order_items.unitCostCents` column (already added in Phase A scaffolding) so future ERP reports (Phase E) can compute store-level profitability.

This phase delivers the **production cost** half of the recipe system. Nutrition derivation and PDP rendering land in Phase D. Allergens are derived from recipe ingredients here but the public PDP keeps reading the manual `allergenCodes` column from Phase A until Phase D switches the source.

## Goals

- Admin can build a recipe (final or sub-recipe) using ingredients and other sub-recipes.
- Live cost preview updates as items are edited (cost per unit, batch cost, batch yield, derived allergens).
- Each product can be linked to a final recipe; production cost is read-only on the product page.
- Cost is snapshotted on `order_items.unitCostCents` at order creation so historical orders carry their cost-at-time-of-sale.
- Sub-recipes are reusable; cycle detection and 3-level depth cap are enforced.
- **Recipe duplication is a first-class MVP feature** — the "recipe 6 onward is mostly a variant of recipe N-1" workflow.
- **Ingredient picker has a dual mode**: pick a single ingredient/sub-recipe, OR bulk-import all items from another recipe as the starting point.
- **Picker pins recent + frequent items** so common ingredients are 1 click away after the first few recipes.

## Non-goals

- Nutrition computation and display on PDP — Phase D.
- Switching public PDP allergens from manual (Phase A) to derived (Phase D).
- Recipe versioning / history (cost snapshot on `order_items` covers the historical-correctness need).
- Per-ingredient yield loss (recipe-level `yieldLossPercent` is enough for now).
- Find-replace ingredient across recipes; bulk scale; recipe duplication. All future, see [Out of scope](#out-of-scope).
- Public-facing changes. Admin-only phase.

---

## Prerequisites (must ship before this)

Phase C assumes these are in place. Detailed in the linked specs / overview.

```typescript
// from Phase B (per arc-overview §3 pricing model)
ingredients {
  id: text PK             // 'ing_…'
  name: text
  slug: text unique
  baseUnit: text          // 'g' | 'piece'
  pricePerKgCents: integer | null     // when baseUnit = 'g' (XOR)
  pricePerPieceCents: integer | null  // when baseUnit = 'piece' (XOR)
  gramsPerPiece: integer? // required when baseUnit = 'piece'
  allergenCodes: text[]   // FK semantics against allergens.code (Phase A)
  nutritionPer100: jsonb  // populated by AI autofill in Phase B; Phase C does not read it
  isActive: boolean
  createdAt, updatedAt: timestamp
}

ingredient_price_history {
  id, ingredientId, pricePerKgCents | null, pricePerPieceCents | null, effectiveFrom, supplier?, source
}

// from Phase A pre-A scaffolding (per arc-overview §2)
order_items.unitCostCents: integer | null  // already present; Phase C is the first phase to write it

// from Phase A pre-A scaffolding
src/lib/auth/guards.ts:  requireRecipeView, requireRecipeEdit, requireCostView
src/lib/logger.ts:       log.recipes namespace
src/app/(admin)/admin/products/[id]/...:  Tabs structure (Info | Recenzie); Phase C adds Recept tab
```

If Phase B has not shipped, Phase C cannot start. The recipe builder needs a stocked ingredient catalog with real prices to be useful.

---

## What to build

### 1. Schema changes (`src/db/schema.ts`) — REQUIRES HUMAN APPROVAL

#### New table: `recipes`

```typescript
export const RECIPE_KINDS = ["product", "sub_recipe"] as const;
export const RECIPE_STATUSES = ["draft", "published"] as const;

export const recipes = pgTable(
  "recipes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("rec")),
    name: text("name").notNull().default("Nový recept"),
    slug: text("slug")
      .notNull()
      .unique()
      .$defaultFn(() => draftSlug("Nový recept")),
    kind: text("kind")
      .$type<(typeof RECIPE_KINDS)[number]>()
      .notNull()
      .default("product"),
    status: text("status")
      .$type<(typeof RECIPE_STATUSES)[number]>()
      .notNull()
      .default("draft"),
    batchYieldUnits: integer("batch_yield_units").notNull().default(1),
    batchYieldGrams: integer("batch_yield_grams").notNull().default(0),
    yieldLossPercent: integer("yield_loss_percent").notNull().default(10),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("idx_recipes_kind_status").on(t.kind, t.status),
    index("idx_recipes_slug").on(t.slug),
    check("recipes_yield_units_positive", sql`${t.batchYieldUnits} > 0`),
    check("recipes_yield_grams_non_negative", sql`${t.batchYieldGrams} >= 0`),
    check(
      "recipes_loss_percent_range",
      sql`${t.yieldLossPercent} >= 0 AND ${t.yieldLossPercent} <= 50`
    ),
  ]
);
```

#### New table: `recipe_items`

The BOM. Each row is **either** an ingredient OR a sub-recipe — exactly one of the two FKs is non-null. Enforced by a CHECK constraint.

```typescript
export const recipeItems = pgTable(
  "recipe_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createPrefixedId("rci")),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientId: text("ingredient_id").references(() => ingredients.id, {
      onDelete: "restrict",
    }),
    subRecipeId: text("sub_recipe_id").references(() => recipes.id, {
      onDelete: "restrict",
    }),
    quantityBaseUnit: integer("quantity_base_unit").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    notes: text("notes"),
  },
  (t) => [
    index("idx_recipe_items_recipe_id").on(t.recipeId, t.sortOrder),
    index("idx_recipe_items_ingredient_id").on(t.ingredientId),
    index("idx_recipe_items_sub_recipe_id").on(t.subRecipeId),
    check(
      "recipe_items_xor_ingredient_or_subrecipe",
      sql`(${t.ingredientId} IS NOT NULL) <> (${t.subRecipeId} IS NOT NULL)`
    ),
    check("recipe_items_quantity_positive", sql`${t.quantityBaseUnit} > 0`),
    check("recipe_items_no_self_reference", sql`${t.subRecipeId} <> ${t.recipeId}`),
    // Direct cycle prevention only; multi-hop cycles checked in app layer.
    unique("recipe_items_unique_ingredient").on(t.recipeId, t.ingredientId),
    unique("recipe_items_unique_subrecipe").on(t.recipeId, t.subRecipeId),
  ]
);
```

The `unique` indexes prevent duplicate rows for the same ingredient/sub-recipe. They allow `NULL`s to coexist (PG default), so the XOR constraint above is the actual safety net.

#### New columns on existing tables

**`products.recipeId`** — nullable FK to `recipes`. A product without a recipe still works; cost panel shows "Recept nepriradený".

```typescript
recipeId: text("recipe_id").references(() => recipes.id, {
  onDelete: "set null",
}),
```

**`order_items.unitCostCents`** — **already added in Phase A scaffolding**, not part of Phase C's migration. Phase C is the first phase that writes a value into this column.

#### Relations

```typescript
export const recipesRelations = relations(recipes, ({ many, one }) => ({
  items: many(recipeItems),
  product: one(products, {
    fields: [recipes.id],
    references: [products.recipeId],
  }),
}));

export const recipeItemsRelations = relations(recipeItems, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeItems.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeItems.ingredientId],
    references: [ingredients.id],
  }),
  subRecipe: one(recipes, {
    fields: [recipeItems.subRecipeId],
    references: [recipes.id],
  }),
}));

// Extend productsRelations
recipe: one(recipes, {
  fields: [products.recipeId],
  references: [recipes.id],
}),
```

#### Migration steps

1. `pnpm db:generate` — produces three migration files (or one combined). Verify the XOR check is generated correctly; PG sometimes needs hand-tweaking for boolean-arithmetic CHECKs.
2. `pnpm db:migrate`.
3. No data backfill. `products.recipeId` and `order_items.unitCostCents` start NULL across the board. Existing orders are unaffected.

---

### 2. Cost resolver (pure function, importable from server + client)

**File:** `src/features/recipes/lib/cost-resolver.ts`

The single source of truth for cost / allergen computation. Pure, no DB access. Takes already-loaded data structures, returns computed numbers. Used by:

- Server actions (authoritative compute on save and at order creation)
- Client preview panel (instant feedback during edit)

#### Input shape

```typescript
export type IngredientLite = {
  id: string;
  name: string;
  baseUnit: "g" | "piece";
  pricePerKgCents: number | null;     // when baseUnit = 'g'
  pricePerPieceCents: number | null;  // when baseUnit = 'piece'
  gramsPerPiece: number | null;
  allergenCodes: AllergenCode[];
};

export type RecipeLite = {
  id: string;
  name: string;
  batchYieldUnits: number;
  batchYieldGrams: number;
  yieldLossPercent: number;
  items: RecipeItemLite[];
};

export type RecipeItemLite = {
  ingredientId: string | null;
  subRecipeId: string | null;
  quantityBaseUnit: number;
};

export type ResolverContext = {
  ingredients: Map<string, IngredientLite>;
  recipes: Map<string, RecipeLite>;
};

export type ResolvedCost = {
  batchCostCents: number;
  costPerUnitCents: number;
  allergenCodes: AllergenCode[];   // canonical-sorted, de-duped
  finishedMassGrams: number;        // batchYieldGrams * (1 - lossPct/100)
  trace: ResolvedCostItem[];        // one row per item, for the UI table
};

export type ResolvedCostItem = {
  itemId: string;                  // matches recipe_items.id (when from server)
  kind: "ingredient" | "sub_recipe";
  refId: string;                    // ingredientId or subRecipeId
  quantityBaseUnit: number;
  unitCostCents: number;            // ingredient.pricePerBaseUnit OR computed sub-recipe per-unit cost
  totalCostCents: number;           // unitCost * quantity
  allergenCodes: AllergenCode[];
};
```

#### Algorithm

```typescript
export function resolveRecipeCost(
  recipeId: string,
  ctx: ResolverContext,
  visited: Set<string> = new Set()
): ResolvedCost {
  if (visited.has(recipeId)) {
    throw new RecipeCycleError(recipeId, [...visited]);
  }
  if (visited.size >= MAX_RECIPE_DEPTH) {           // MAX_RECIPE_DEPTH = 3
    throw new RecipeDepthError(recipeId, visited.size);
  }
  visited.add(recipeId);

  const recipe = ctx.recipes.get(recipeId);
  if (!recipe) throw new RecipeNotFoundError(recipeId);

  let batchCostCents = 0;
  const allergens = new Set<AllergenCode>();
  const trace: ResolvedCostItem[] = [];

  for (const item of recipe.items) {
    if (item.ingredientId) {
      const ing = ctx.ingredients.get(item.ingredientId);
      if (!ing) throw new IngredientNotFoundError(item.ingredientId);

      // Per arc-overview §3: storage is cents/kg (mass) or cents/piece (piece)
      let total: number;
      let perUnit: number;
      if (ing.baseUnit === "g") {
        if (ing.pricePerKgCents === null) { total = 0; perUnit = 0; }
        else {
          perUnit = ing.pricePerKgCents;
          total = Math.round(item.quantityBaseUnit * ing.pricePerKgCents / 1000);
        }
      } else {
        if (ing.pricePerPieceCents === null) { total = 0; perUnit = 0; }
        else {
          perUnit = ing.pricePerPieceCents;
          total = item.quantityBaseUnit * ing.pricePerPieceCents;
        }
      }

      batchCostCents += total;
      for (const c of ing.allergenCodes) allergens.add(c);
      trace.push({ kind: "ingredient", refId: ing.id, quantityBaseUnit: item.quantityBaseUnit,
        unitCostCents: perUnit, totalCostCents: total,
        allergenCodes: ing.allergenCodes, hasPrice: perUnit > 0 } as ResolvedCostItem);
    } else if (item.subRecipeId) {
      const sub = resolveRecipeCost(item.subRecipeId, ctx, new Set(visited));
      const subPerGram = sub.batchCostCents / Math.max(sub.finishedMassGrams, 1);
      const total = Math.round(subPerGram * item.quantityBaseUnit);
      batchCostCents += total;
      for (const c of sub.allergenCodes) allergens.add(c);
      trace.push({ kind: "sub_recipe", refId: item.subRecipeId, quantityBaseUnit: item.quantityBaseUnit,
        unitCostCents: Math.round(subPerGram), totalCostCents: total,
        allergenCodes: sub.allergenCodes, hasPrice: subPerGram > 0 } as ResolvedCostItem);
    }
  }

  const finishedMassGrams = Math.round(
    recipe.batchYieldGrams * (1 - recipe.yieldLossPercent / 100)
  );
  const costPerUnitCents = Math.round(batchCostCents / Math.max(recipe.batchYieldUnits, 1));

  return {
    batchCostCents,
    costPerUnitCents,
    allergenCodes: [...allergens].sort((a, b) => ALLERGEN_ORDER[a] - ALLERGEN_ORDER[b]),
    finishedMassGrams,
    trace,
  };
}

export class RecipeCycleError extends Error {}
export class RecipeDepthError extends Error {}
export class RecipeNotFoundError extends Error {}
export class IngredientNotFoundError extends Error {}
```

Notes:
- **Pricing model** is the canonical one from [arc overview §3](./_arc-overview.md#3-pricing-model-canonical): cents/kg for mass-based ingredients, cents/piece for piece-based. Resolver divides by 1000 for the mass case; piece case has no division.
- **Zero-priced ingredients** (null `pricePerKgCents` / `pricePerPieceCents`, or admin-set 0) contribute zero. The `hasPrice` flag on each trace item lets the live preview surface "N surovín bez ceny" warnings to the admin.
- Sub-recipe cost contribution is computed **per gram of finished sub-recipe** (`subBatchCost / subFinishedMass`), then multiplied by the quantity used. This is the correct model when a sub-recipe is consumed by mass (kvások, krém) — which is the bakery default.
- All math in cents. Round once at the end of each recipe to avoid drift.
- `visited` is cloned per branch (`new Set(visited)`) so siblings don't see each other's path.
- Errors are typed so the action layer can map them to user-friendly Slovak messages.

#### Cycle / depth pre-check helper

`src/features/recipes/lib/can-add-sub-recipe.ts` — for the picker UI to filter invalid options at open time:

```typescript
export function canAddSubRecipe(
  hostRecipeId: string,
  candidateSubRecipeId: string,
  recipesGraph: Map<string, string[]>   // recipeId -> sub-recipe IDs
): { ok: true } | { ok: false; reason: "self" | "cycle" | "depth" };
```

Returns `{ ok: false, reason }` when adding the candidate would self-reference, create a cycle, or exceed depth 3. Keeps the picker filter logic out of components.

---

### 3. Feature module: `src/features/recipes/`

```
src/features/recipes/
├── api/
│   ├── queries.ts
│   └── actions.ts
├── components/
│   ├── recipe-builder.tsx          # the page-level builder (used by both routes)
│   ├── recipe-header-form.tsx      # name, kind, yields, loss
│   ├── recipe-items-table.tsx      # sortable rows
│   ├── recipe-item-row.tsx         # single editable row
│   ├── ingredient-picker.tsx       # cmdk palette (ingredients + sub-recipes)
│   ├── inline-ingredient-sheet.tsx # creates ingredient from picker
│   ├── live-preview-panel.tsx      # cost / allergens
│   ├── recipe-list-table.tsx       # /admin/recipes
│   └── product-recipe-tab.tsx      # tab content on product page
├── lib/
│   ├── cost-resolver.ts
│   ├── can-add-sub-recipe.ts
│   └── client-preview.ts           # client-side wrapper around cost-resolver
└── schema.ts
```

#### `schema.ts` — Zod

```typescript
import { z } from "zod";

export const RECIPE_KINDS = ["product", "sub_recipe"] as const;
export const RECIPE_STATUSES = ["draft", "published"] as const;

export const recipeHeaderSchema = z.object({
  name: z.string().trim().min(1, "Názov je povinný").max(100),
  kind: z.enum(RECIPE_KINDS),
  status: z.enum(RECIPE_STATUSES),
  batchYieldUnits: z.number().int().positive("Výnos musí byť kladné číslo"),
  batchYieldGrams: z.number().int().min(0),
  yieldLossPercent: z.number().int().min(0).max(50),
  notes: z.string().trim().max(2000).nullable(),
});

export const addRecipeItemSchema = z.object({
  recipeId: z.string().min(1),
  ingredientId: z.string().min(1).optional(),
  subRecipeId: z.string().min(1).optional(),
  quantityBaseUnit: z.number().int().positive(),
}).refine(
  (v) => Boolean(v.ingredientId) !== Boolean(v.subRecipeId),
  { message: "Buď ingrediencia alebo subrecept, nie oboje" }
);

export const updateRecipeItemSchema = z.object({
  itemId: z.string().min(1),
  quantityBaseUnit: z.number().int().positive(),
});

export const removeRecipeItemSchema = z.object({
  itemId: z.string().min(1),
});

export const reorderRecipeItemsSchema = z.object({
  recipeId: z.string().min(1),
  orderedItemIds: z.array(z.string().min(1)).min(1),
});

export const linkProductRecipeSchema = z.object({
  productId: z.string().min(1),
  recipeId: z.string().min(1).nullable(),   // null = unlink
});

export type RecipeHeaderSchema = z.infer<typeof recipeHeaderSchema>;
export type AddRecipeItemSchema = z.infer<typeof addRecipeItemSchema>;
export type UpdateRecipeItemSchema = z.infer<typeof updateRecipeItemSchema>;
```

#### `api/queries.ts`

All queries use `"use cache"`, `cacheLife("hours")`, tagged for invalidation.

```typescript
"use cache";
// getRecipes(opts?: { kind?: RecipeKind })  → list, tag "recipes"
// getRecipeById(id)                          → recipe + items + nested ingredient/sub-recipe data, tag "recipes" + `recipe-${id}`
// getRecipeByProductId(productId)            → resolver-ready data for a product's recipe (or null)
// getResolverContext()                       → { ingredients: Map, recipes: Map } loaded as Maps for the resolver, tag "ingredients" + "recipes"
// getRecipeDependents(recipeId)              → list of products + parent recipes referencing this recipe (for the "used by N products" footer)
// getRecipeGraph()                           → Map<recipeId, subRecipeIds[]> for the picker's cycle/depth check, tag "recipes"
```

`getResolverContext()` is the workhorse: returns the full ingredient catalog + all published recipes as Maps, ready to feed `resolveRecipeCost()`. Cached aggressively (tag `recipes` + `ingredients`); invalidated on any recipe/ingredient mutation. Payload size is bounded — hundreds of rows max — so caching the whole graph is cheap.

#### `api/actions.ts`

All actions: `"use server"`, `await requireRecipeEdit()` (from pre-A scaffolding; admin + manager), error logged via `log.recipes.error()` (added in pre-A scaffolding), `revalidateTag()` after success.

| Action | Input | Effect | Tags invalidated |
|---|---|---|---|
| `createRecipeAction` | `{ kind }` | Insert with defaults; if `kind=product` and called from product page, also link via `setProductRecipeAction`; redirect | `recipes` |
| `updateRecipeHeaderAction` | `{ id, header }` | Validate + update; if `kind` switched to `sub_recipe`, unlink any product first | `recipes`, `recipe-${id}`, `products` |
| `deleteRecipeAction` | `{ id }` | Block if it's a sub-recipe used by another recipe (check `getRecipeDependents`); delete cascades items | `recipes`, `recipe-${id}`, `products` |
| `duplicateRecipeAction` | `{ id }` | Copy recipe + all items into a new `status=draft` recipe named `<name> (kópia)`; redirect to new id | `recipes` |
| `addRecipeItemAction` | `AddRecipeItemSchema` | Insert; pre-check cycle/depth for sub-recipes via `canAddSubRecipe`; sortOrder = max+1 | `recipes`, `recipe-${recipeId}`, `products`, `reports` |
| `bulkAddItemsFromRecipeAction` | `{ targetRecipeId, sourceRecipeId }` | Copy every item from `source` into `target` (sequential inserts, skip dups); respects cycle/depth for any sub-recipes | `recipes`, `recipe-${targetRecipeId}`, `products`, `reports` |
| `updateRecipeItemAction` | `UpdateRecipeItemSchema` | Update quantity | `recipes`, `recipe-${recipeId}`, `products`, `reports` |
| `removeRecipeItemAction` | `RemoveRecipeItemSchema` | Delete row | `recipes`, `recipe-${recipeId}`, `products`, `reports` |
| `reorderRecipeItemsAction` | `ReorderRecipeItemsSchema` | Sequential UPDATEs (no transactions); idempotent | `recipes`, `recipe-${recipeId}` |
| `linkProductRecipeAction` | `LinkProductRecipeSchema` | Set `products.recipeId` (or null); validate target recipe is `kind=product` | `products`, `product-${slug}`, `recipes` |
| `publishRecipeAction` | `{ id }` | Validate via resolver (must succeed without errors), set `status=published` | `recipes`, `recipe-${id}`, `reports` |

See [arc overview §5](./_arc-overview.md#5-cache-tag-matrix) for the full invalidation matrix.

Every mutating action that affects cost/allergens of a product also invalidates `products` so PDP allergen list (Phase A) reflects ingredient changes when Phase D goes live without an extra invalidation pass.

**Neon HTTP constraint:** `reorderRecipeItemsAction` is sequential UPDATEs (no `db.transaction()`). Order doesn't matter for correctness — partial failures leave a consistent state because each row's sortOrder is independent.

---

### 4. Routes

#### `/admin/recipes` — sub-recipe list page

`src/app/(admin)/admin/recipes/page.tsx`

- Lists `kind=sub_recipe` rows only. Final recipes (`kind=product`) are reached through their parent product, not here.
- Columns: name, items count, used-in count, status (draft/published), updated-at, actions
- Header button: "+ Nový subrecept" → calls `createRecipeAction({ kind: "sub_recipe" })` → redirects to `/admin/recipes/[id]`
- Server component, `requireRecipeView()` at the top (admin + manager; baker added in Phase 4 per [arc overview §4](./_arc-overview.md#4-role-matrix))

Add to admin nav under a new "Recepty" section.

#### `/admin/recipes/[id]` — sub-recipe builder

`src/app/(admin)/admin/recipes/[id]/page.tsx`

- Loads recipe + resolver context in parallel
- Renders `<RecipeBuilder>` (the same component used by the product tab)
- 404 if recipe doesn't exist or is `kind=product` (those are reached via product page)

#### `/admin/products/[id]` — tabs added

`src/app/(admin)/admin/products/[id]/page.tsx` and `_components/product-form.tsx`

The product page tab structure already exists from Phase A scaffolding (`Info | Recenzie`). Phase C **adds the Recept tab** between them:

```
[ Info ] [ Recept ] [ Recenzie ]
```

(Phase A had 2 tabs; Phase C adds 1. Future ceny/obrazky splits, if ever needed, happen separately.)

Tab strategy:
- URL param `?tab=info|recept|recenzie`
- Tabs primitive: [src/components/ui/tabs.tsx](src/components/ui/tabs.tsx)
- Each tab's data is fetched only when active (server-side check on `searchParams.tab`). The Recept tab's resolver context is the heaviest payload, so this matters.
- Recept tab visibility: server-side `requireRecipeView()` on the tab's data fetch and `requireRecipeEdit()` on every mutating action; client-side the tab trigger is hidden for non-staff (cosmetic, not security). When the baker role lands in Phase 4, only `requireRecipeView()` adds it — bakers see the tab but can't edit.

The existing single-column form gets split across Info / Ceny / Obrázky tabs. Mostly a re-org, no logic changes. Reviews tab is a passthrough to existing review queries.

#### Product Recept tab states

Rendered by `<ProductRecipeTab>`:

1. **No recipe linked**
   - Empty state with two CTAs: `[Vytvoriť recept]` (creates new `kind=product` recipe and reloads tab) | `[Prepojiť existujúci]` (combobox of unlinked `kind=product` recipes)

2. **Linked recipe**
   - Renders `<RecipeBuilder>` inline, fully editable
   - Header gets a strip: `[Otvoriť na samostatnej stránke ↗]` `[Odpojiť od produktu]`

3. **Linked recipe missing or archived** (defensive)
   - Warning chip + `[Odpojiť]`

The "Otvoriť na samostatnej stránke" link points to `/admin/recipes/[id]` — same builder, different chrome. Useful when the admin wants to focus mode without product-page distractions.

---

### 5. Recipe builder component

**File:** `src/features/recipes/components/recipe-builder.tsx`

`"use client"` page-level component, hosts:
- `<RecipeHeaderForm>` — RHF + Zod, explicit `[Uložiť]` button, calls `updateRecipeHeaderAction`
- `<RecipeItemsTable>` — autosaving rows, dnd-kit reorder
- `<LivePreviewPanel>` — sticky right-side card on desktop, collapsible drawer on mobile
- `<IngredientPicker>` — `<Command>` palette opened by the items table

#### Items table behavior (the hot path)

- Each row: drag handle (dnd-kit `useSortable`), ingredient/sub-recipe cell, quantity input, unit badge (read-only, derived from ingredient.baseUnit), cost contribution (derived), % of batch (derived), remove button
- Quantity input: debounced 500 ms autosave via `updateRecipeItemAction`. Debounced via a single ref-stored timer per row.
- Optimistic UI via `useOptimistic`: typed quantity reflects in the row + preview panel before server confirms
- Failed autosave: row goes red with retry button; preview reverts to last server state
- Row remove: optimistic delete + `removeRecipeItemAction`
- Ingredient swap: clicking the ingredient cell opens the picker re-targeted at that row; selection calls a combined remove+add or a dedicated `replaceRecipeItemAction` (TBD: probably a remove+add for simplicity)
- Drag-drop: optimistic reorder, debounced 800 ms `reorderRecipeItemsAction` with the new orderedItemIds

#### Picker (`<IngredientPicker>`)

Dual-mode `<Command>` palette ([src/components/ui/command.tsx](src/components/ui/command.tsx)) with a tab strip at the top:

**Tab 1: "Ingrediencie"** (default)
- Fuzzy search across ingredients + sub-recipes in one list
  - Search uses Phase B's pg_trgm + unaccent: "muka" matches "Hladká múka T650"
- Sub-recipes shown with `📦` prefix and "Subrecept" pill
- Filters out:
  - Already-used items in the current recipe
  - Sub-recipes that fail `canAddSubRecipe` (self / cycle / depth)
  - Inactive ingredients
- **Pinned to top:**
  - "Naposledy použité" (last 7 days for this user) — persisted in `localStorage` under `recipe-builder:recent:${userId}` (max 10)
  - "Najčastejšie" — global top-10 by usage count across all recipes, fetched from a new cached query `getMostUsedIngredients()` (tag `recipes`, refreshed on any recipe edit)
- Bottom action: `+ Vytvoriť novú ingredienciu "<query>"` when there's no exact match — opens `<InlineIngredientSheet>`

**Tab 2: "Z iného receptu"**
- Searchable list of all published recipes (both `kind=product` and `kind=sub_recipe`)
- Selecting a source recipe shows a preview of its items
- `[Pridať všetky položky]` button calls `bulkAddItemsFromRecipeAction`
- Items already in the target recipe are pre-checked-and-disabled in the preview
- Closes the picker after success

This is the killer feature for the "recipe 6+ workflow": the admin builds a new recipe by copying from an existing similar one and tweaking 2-3 quantities. See [arc overview §1](./_arc-overview.md#1-phase-sequencing) and the spike conversation.

#### Inline ingredient sheet

- `<Sheet>` overlay that hosts the ingredient form (reusing Phase B's `<IngredientForm>`)
- Saves via Phase B's `createIngredientAction` returning the new ingredient
- On save: closes sheet, re-opens picker with the new ingredient pre-selected, focus jumps to quantity input

#### Live preview panel

- Sticky card, ~300px wide on desktop, full-width drawer on mobile
- Updates **client-side** on every items state change via `client-preview.ts` (wraps the resolver against an in-memory `ResolverContext` built from the page's loaded data)
- Each successful autosave returns the server-authoritative `ResolvedCost` and reconciles. On drift, server wins, brief `Synchronizujem...` indicator
- Sections (in order):
  - Cost per unit (big number, EUR formatted)
  - Batch cost + yield (units / grams)
  - Alergény (chips, derived)
  - **Note: nutrition section is added in Phase D — not rendered here**
- **Warnings (yellow strip below KPIs):**
  - "N surovín bez ceny — vypočítaná cena je neúplná" when any item in the trace has `hasPrice === false`. Click jumps to the offending row.
  - "Šarža nemá zadanú hmotnosť (g)" when `batchYieldGrams === 0` — blocks Phase D nutrition but not Phase C cost.
- If the resolver throws (cycle / missing / depth), preview goes to error state with a red banner: "Recept obsahuje cyklus" / "Recept presahuje 3 úrovne" / "Chýba ingrediencia"

#### Mobile

The whole builder renders read-only on screens narrower than `md`. Header form + items table + preview stack vertically, all inputs disabled, with a banner: "Úpravy receptu sú možné len na počítači."

---

### 6. Order snapshot at checkout

**File:** `src/features/orders/actions/create-b2c-order.ts`

When inserting `order_items`, populate `unitCostCents` for each line:

```typescript
// inside the order creation action, before insert(orderItems)
const ctx = await getResolverContext();
const items = cartItems.map((cartItem) => {
  const product = ctx.productsById.get(cartItem.productId);
  let unitCostCents: number | null = null;
  if (product?.recipeId) {
    try {
      const resolved = resolveRecipeCost(product.recipeId, ctx);
      unitCostCents = resolved.costPerUnitCents;
    } catch (err) {
      log.orders.warn(
        { err, productId: cartItem.productId, recipeId: product.recipeId },
        "Cost snapshot failed; storing null"
      );
    }
  }
  return {
    orderId,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    price: cartItem.priceCents,
    unitCostCents,                       // new column
    productSnapshot: { /* existing */ },
  };
});
```

Cost resolution failures **must not** break checkout. Log a warning, store NULL, continue. This is the most important rule of this section: customer ordering trumps internal cost tracking.

The same logic applies to B2B order creation when that lands.

---

### 7. Admin nav

`src/app/(admin)/admin/_components/sidebar.tsx` (or wherever the admin nav lives) — add:

- "Suroviny" (Phase B's ingredients page, if not already linked)
- "Recepty" (sub-recipe list) → `/admin/recipes`

Both gated to staff roles client-side; server-side guards still required on the pages themselves.

---

## File summary

| Action | File |
|---|---|
| Edit | `src/db/schema.ts` — `recipes`, `recipe_items` tables; `products.recipeId`; relations (**human approval**). `order_items.unitCostCents` was already added in Phase A scaffolding. |
| Generate | `drizzle/NNNN_recipes.sql` migration |
| Create | `src/features/recipes/schema.ts` |
| Create | `src/features/recipes/api/queries.ts` |
| Create | `src/features/recipes/api/actions.ts` |
| Create | `src/features/recipes/lib/cost-resolver.ts` |
| Create | `src/features/recipes/lib/can-add-sub-recipe.ts` |
| Create | `src/features/recipes/lib/client-preview.ts` |
| Create | `src/features/recipes/components/recipe-builder.tsx` |
| Create | `src/features/recipes/components/recipe-header-form.tsx` |
| Create | `src/features/recipes/components/recipe-items-table.tsx` |
| Create | `src/features/recipes/components/recipe-item-row.tsx` |
| Create | `src/features/recipes/components/ingredient-picker.tsx` |
| Create | `src/features/recipes/components/inline-ingredient-sheet.tsx` |
| Create | `src/features/recipes/components/live-preview-panel.tsx` |
| Create | `src/features/recipes/components/recipe-list-table.tsx` |
| Create | `src/features/recipes/components/product-recipe-tab.tsx` |
| Create | `src/app/(admin)/admin/recipes/page.tsx` |
| Create | `src/app/(admin)/admin/recipes/[id]/page.tsx` |
| Edit | `src/app/(admin)/admin/products/[id]/page.tsx` — tab-aware data fetch by `searchParams.tab` |
| Edit | `src/app/(admin)/admin/products/[id]/_components/product-form.tsx` — wrap content in `<Tabs>` |
| Edit | `src/features/orders/actions/create-b2c-order.ts` — populate `unitCostCents`; add `revalidateTag("reports")` so Phase E sees fresh data |
| Verify | `src/lib/logger.ts` — `recipes` namespace was added in pre-A scaffolding |
| Edit | `src/app/(admin)/admin/_components/sidebar.tsx` — nav entry for Recepty |
| Edit | `docs/database-schema.md` — document new tables + columns |
| Edit | `docs/features-catalog.json` — add `recipes` feature, update `lastUpdated` |
| Add dep | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (~12 KB gzipped total) |

---

## Constraints (from `CLAUDE.md`)

- **No `db.transaction()` / `db.batch()`** — Neon HTTP. Sequential writes; defensive ordering.
- **No barrel files** — direct imports.
- **No dynamic imports of internal modules.**
- **Slovak language** for user-facing text; code in English.
- **`requireRecipeEdit()` / `requireRecipeView()`** on actions and tab data fetch (admin + manager). When the baker role lands in Phase 4, the **View** guard adds it; Edit stays admin+manager. See [arc overview §4](./_arc-overview.md#4-role-matrix).
- **Schema changes require human approval** before editing `src/db/schema.ts`.
- **No `pnpm db:push`** — generate + migrate.
- **Costs in cents** (integer) throughout. Formatted via `formatPrice()` only at the render boundary.
- **Structured logging** via `log.recipes.error()` / `log.orders.warn()`.
- **`cacheLife("hours")` + `cacheTag()`** on all queries; `revalidateTag()` after mutations.

---

## Performance notes

- Recipe page initial payload: recipe + items + full ingredient catalog + recipe graph. With ~500 ingredients and ~50 recipes, JSON payload is ~100 KB pre-gzip. Acceptable.
- Cost resolver runs in O(items × depth). Depth is capped at 3, so effectively linear in items.
- Cache invalidation cascade on a single ingredient price update: `ingredients` tag → server preview recomputes for any open recipe page on next interaction. No push needed; polling-on-action is sufficient for an admin-only feature.
- Order checkout adds one `getResolverContext()` call per order. Cached, so amortized cost is near zero.

---

## Risks and decisions to lock in

1. **`replaceRecipeItemAction` vs remove+add.** Picking remove+add for simplicity; if optimistic UI feels janky during ingredient swap, refactor later.
2. **dnd-kit dependency.** ~12 KB gzipped. Confirmed worth it; alternative (up/down arrow buttons) is a worse UX for any list > 5 items.
3. **`localStorage` for "recently used" ingredients.** Per-browser, not per-user. Acceptable for a small admin team. If multi-device sync becomes needed, move to a `user_preferences` table.
4. **Cost snapshot on order failure.** Storing NULL when resolver throws is the safe default. Loud monitoring on the `log.orders.warn` calls so we notice patterns.
5. **Concurrent recipe edits by two admins.** Last-write-wins per row. Real risk is low; defer presence indicators.
6. **Recipe slug.** Auto-generated from name like products are. Useful for `/admin/recipes/by-slug/[slug]` later but unused in Phase C.
7. **What if a sub-recipe is unpublished?** Resolver only walks `published` recipes when called from the order snapshot path. From the admin builder, we walk drafts too so the preview works while building. Two callers, two `includeDrafts` flags on `getResolverContext()`.

---

## Out of scope (future / Phase D / Phase E)

- Nutrition derivation + display on PDP — Phase D
- Switching PDP allergens to derived source — Phase D
- `unitCostCents` reporting / store P&L queries — Phase E
- Recipe scale (multiply all quantities) / find-replace ingredient across recipes
- Recipe versioning / history (cost snapshot covers historical correctness)
- Vector-based recipe similarity ("find recipes similar to this one") — possible Phase D+ once we have ≥50 published recipes; see [arc overview §9](./_arc-overview.md#9-fuzzy-search--duplicate-detection)
- Per-ingredient yield loss
- Sub-recipe presence indicator (multi-admin awareness)
- Mobile recipe editing
- B2B-format printable nutrition labels
- Public-facing "Z čoho je vyrobené" ingredient list on PDP

---

## Acceptance criteria

- [ ] Schema migration runs cleanly, no data backfill needed
- [ ] Admin can create a sub-recipe at `/admin/recipes` and add it to a product's recipe via the picker
- [ ] Live preview updates cost per unit + allergens within ~50 ms of typing a quantity
- [ ] Live preview shows "N surovín bez ceny" warning when any item lacks a price
- [ ] Resolver unit tests cover: cycle, depth-exceeded, missing ingredient, sub-recipe by mass, deep nesting, zero-priced ingredients (per [arc overview §11](./_arc-overview.md#11-testing-strategy))
- [ ] Cycle creation is impossible from the picker; defensive resolver throws if a cycle slips in via direct DB edit
- [ ] Depth-4 sub-recipe insertion is blocked at picker level
- [ ] Deleting an ingredient that's used in any recipe is blocked with a clear error listing the recipes
- [ ] **`[Duplikovať]` action on every recipe** creates a draft copy and redirects
- [ ] **Picker "Z iného receptu" mode** imports all items from a source recipe in one click
- [ ] Picker pins recent (per-user, localStorage) + most-frequent (global, cached query)
- [ ] Picker search is diacritic-free via pg_trgm: "muka" finds "Hladká múka T650"
- [ ] New B2C order has non-null `unitCostCents` on `order_items` when the product has a published recipe
- [ ] Order creation continues without error when a recipe is missing or has resolver issues (NULL stored, warning logged)
- [ ] Product page Recept tab is hidden for `user` role; visible for `admin` and `manager` (and `baker` after Phase 4, view-only)
- [ ] Recipe page mobile view is read-only with a clear notice
- [ ] All recipe queries are cached and invalidated per the [tag matrix](./_arc-overview.md#5-cache-tag-matrix)
- [ ] No barrel files; no dynamic imports of internal modules; all actions guard with `requireRecipeEdit()`
