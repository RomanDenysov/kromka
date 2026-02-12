# B2B Price Tiers CRUD — Implementation Spec

## Overview

Implement full CRUD admin interface for B2B price tiers. Each tier defines custom product prices for B2B organizations. Organizations are assigned a price tier, and when B2B customers browse products, they see tier-specific prices instead of base prices.

## Current State

### Database Schema (`src/db/schema.ts`)

**`priceTiers` table (line ~748):**
- `id` — text PK, prefixed `pri_tier_` (auto-generated via `createPrefixedId`)
- `name` — text, NOT NULL, default `"Nová cenová skupina"`
- `description` — text, default `"Popis vašej cenovej skupiny..."`
- `createdAt` / `updatedAt` — timestamps

**`prices` table (line ~762):**
- Composite PK: `(productId, priceTierId)`
- `productId` — FK → `products.id` (CASCADE delete)
- `priceTierId` — FK → `priceTiers.id` (CASCADE delete)
- `priceCents` — integer, NOT NULL, default 0, CHECK >= 0

**`organizations` table (line ~116):**
- `priceTierId` — FK → `priceTiers.id` (SET NULL on delete)

### Existing Code

- **Queries** (`src/features/b2b/price-tiers/api/queries.ts`):
  - `getPriceTiers()` — list all tiers sorted by name (NO cache directives yet)
  - `getPriceTierById(id)` — tier + all prices with product details (name, slug, priceCents, image url)
  - `PriceTier` type export

- **List page** (`src/app/(admin)/admin/b2b/price-tiers/page.tsx`):
  - Displays tiers as cards with "Upraviť" link to `/admin/b2b/price-tiers/[id]`
  - No create button

- **No actions file exists** — needs to be created
- **No detail/edit page exists** at `[id]`
- **No Zod schema exists** for price tier validation

### Pricing Utilities (`src/lib/pricing.ts`)
- `getEffectivePrice()` — single product tier price lookup
- `getEffectivePrices()` — batch lookup (Map-based)
- `hasTierPrice()` — check if product has a different tier price

### Integration Points
- B2B client detail form already has price tier selector (`src/components/b2b/client-detail.tsx`)
- Product detail shows tier prices in admin (`src/features/products/api/queries.ts:getAdminProductById`)
- Product copy action copies all tier prices (`src/features/products/api/actions.ts:copyProductAction`)
- B2B catalog overlays tier prices on products (`src/features/products/api/queries.ts:getProductsByCatalog`)

---

## What to Build

### 1. Add Cache Directives to Existing Queries

**File:** `src/features/b2b/price-tiers/api/queries.ts`

Add `"use cache"`, `cacheLife`, and `cacheTag` to both queries:

```typescript
import { cacheLife, cacheTag } from "next/cache";

export async function getPriceTiers() {
  "use cache";
  cacheLife("hours");
  cacheTag("price-tiers");
  // ... existing query
}

export async function getPriceTierById(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("price-tiers", `price-tier-${id}`);
  // ... existing query
}
```

### 2. Zod Validation Schema

**Create:** `src/features/b2b/price-tiers/schema.ts`

```typescript
import { z } from "zod";

export const priceTierSchema = z.object({
  name: z.string().trim().min(1, "Názov je povinný").max(100, "Názov je príliš dlhý"),
  description: z.string().trim().max(500, "Popis je príliš dlhý").nullable(),
});

export type PriceTierSchema = z.infer<typeof priceTierSchema>;

export const priceSchema = z.object({
  productId: z.string().trim().min(1, "Chýba ID produktu"),
  priceTierId: z.string().trim().min(1, "Chýba ID cenovej skupiny"),
  priceCents: z.number().int("Cena musí byť celé číslo").min(0, "Cena nemôže byť záporná"),
});

export type PriceSchema = z.infer<typeof priceSchema>;

export const bulkPricesSchema = z.object({
  priceTierId: z.string().trim().min(1, "Chýba ID cenovej skupiny"),
  prices: z.array(z.object({
    productId: z.string().trim().min(1),
    priceCents: z.number().int().min(0),
  })).min(1, "Žiadne ceny na uloženie"),
});

export type BulkPricesSchema = z.infer<typeof bulkPricesSchema>;
```

### 3. Server Actions

**Create:** `src/features/b2b/price-tiers/api/actions.ts`

Follow the pattern from `src/features/stores/api/actions.ts` and `src/features/categories/api/actions.ts`.

All actions must:
- Start with `"use server"` directive
- Call `await requireAdmin()` before any mutation
- Call `updateTag("price-tiers")` after successful mutations
- Return `{ success: true }` or `{ success: false, error: string }`
- Log errors with `log.b2b.error()`

#### Actions to implement:

**`createPriceTierAction()`**
- Insert new tier with defaults (name/description have DB defaults)
- `updateTag("price-tiers")`
- `redirect(\`/admin/b2b/price-tiers/\${newTier.id}\`)`
- Pattern: see `createDraftStoreAction()` in stores

**`updatePriceTierAction({ id, data })`**
- Validate with `priceTierSchema`
- Update name/description
- `updateTag("price-tiers")`, `updateTag(\`price-tier-\${id}\`)`
- Return `{ success: true }`

**`deletePriceTierAction({ id })`**
- Delete tier (CASCADE will delete all associated prices)
- `updateTag("price-tiers")`, `updateTag(\`price-tier-\${id}\`)`
- `redirect("/admin/b2b/price-tiers")`

**`setPriceAction({ productId, priceTierId, priceCents })`**
- Validate with `priceSchema`
- Upsert: use `db.insert().values().onConflictDoUpdate()` on composite PK
- `updateTag("price-tiers")`, `updateTag("products")`

**`removePriceAction({ productId, priceTierId })`**
- Delete from prices where both columns match
- `updateTag("price-tiers")`, `updateTag("products")`

**`bulkSetPricesAction({ priceTierId, prices })`**
- Validate with `bulkPricesSchema`
- Sequential upserts (no `db.transaction()` — Neon HTTP limitation)
- `updateTag("price-tiers")`, `updateTag("products")`

### 4. "Create New Tier" Button on List Page

**Edit:** `src/app/(admin)/admin/b2b/price-tiers/page.tsx`

Add a button in the header area that calls `createPriceTierAction()`:

```tsx
import { createPriceTierAction } from "@/features/b2b/price-tiers/api/actions";

// In the page component, add after AdminHeader:
<form action={createPriceTierAction}>
  <Button type="submit" size="sm">
    <PlusIcon className="mr-2 size-4" />
    Nová cenová skupina
  </Button>
</form>
```

### 5. Detail/Edit Page

**Create:** `src/app/(admin)/admin/b2b/price-tiers/[id]/page.tsx`

Server component that loads tier data and renders the edit form.

```tsx
import { notFound } from "next/navigation";
import { getPriceTierById } from "@/features/b2b/price-tiers/api/queries";
// ... imports

export default async function PriceTierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tier = await getPriceTierById(id);

  if (!tier) {
    notFound();
  }

  return (
    <>
      <AdminHeader breadcrumbs={[...]} />
      <section className="h-full flex-1 p-4">
        <PriceTierForm tier={tier} />
      </section>
    </>
  );
}
```

### 6. Client Edit Form Component

**Create:** `src/features/b2b/price-tiers/components/price-tier-form.tsx`

`"use client"` component with:

**Tier Info Section:**
- Name input (editable)
- Description textarea (editable)
- Save button → calls `updatePriceTierAction()`
- Delete button with confirmation → calls `deletePriceTierAction()`

**Prices Table Section:**
- Table columns: Product name | Base price | Tier price | Actions
- Show all products in the tier with their prices
- Inline price editing (input field per product row)
- Save individual price → `setPriceAction()`
- Remove price → `removePriceAction()`
- "Save all prices" button → `bulkSetPricesAction()` for batch updates

**Add Product Flow:**
- Button to add a product to the tier
- Combobox or select to pick a product (from all active products)
- Set initial price → `setPriceAction()`

**UI Pattern Reference:**
- Form layout: follow `src/features/stores/components/store-form.tsx` or `src/features/categories/components/category-form.tsx`
- Use React Hook Form + Zod resolver
- Use shadcn/ui form components, `toast` for success/error feedback
- Use `useRouter().refresh()` after mutations

### Key Constraints

- **No `db.transaction()`** — Neon HTTP driver doesn't support it. Use sequential calls.
- **No barrel files** — import directly from specific files.
- **No dynamic imports** — use static imports only.
- **Slovak language** for all user-facing text.
- **Prices in cents** (integer) — display as formatted EUR using `formatPrice()` from `src/lib/utils.ts`.
- **`requireAdmin()`** on every server action.
- **`updateTag()`** for cache invalidation after every mutation.
- **Structured logging** — use `log.b2b.error()` for error cases.

### File Summary

| Action | File |
|--------|------|
| Edit | `src/features/b2b/price-tiers/api/queries.ts` — add cache directives |
| Create | `src/features/b2b/price-tiers/schema.ts` — Zod schemas |
| Create | `src/features/b2b/price-tiers/api/actions.ts` — server actions |
| Edit | `src/app/(admin)/admin/b2b/price-tiers/page.tsx` — add create button |
| Create | `src/app/(admin)/admin/b2b/price-tiers/[id]/page.tsx` — detail page |
| Create | `src/features/b2b/price-tiers/components/price-tier-form.tsx` — edit form |
