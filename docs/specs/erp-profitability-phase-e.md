# ERP Profitability Reports (Phase E) — Implementation Spec

> **Read first:** [`_arc-overview.md`](./_arc-overview.md) for role guards (`requireReportsView`), cache tags, mobile expectations, and the pricing model (Phase E reports are accurate because cents/kg storage from Phase B is lossless for every realistic supplier price).

## Overview

Surface store-level and product-level profitability using the cost data snapshotted in Phase C and the price history captured in Phase B. Phase E is read-only — no new mutations, no schema changes (with one optional materialized-aggregates table for performance, off by default). It turns the data foundations of Phases A-D into actionable reports for owners and managers: revenue, cost, gross margin, margin %, ranked by store / product / category, with date-range filters and CSV export.

This is the closing phase of the recipe-costing arc and the first concrete deliverable of the ERP P/L track described in the project's 7-phase roadmap.

## Goals

- For any date range, show **revenue, cost, gross margin, margin %** broken down by store and by product.
- Surface the **per-product margin distribution** so admins know which products subsidize which.
- Show **ingredient price trends** with a chart and a list of products affected by each change.
- Export each report to **CSV** (Excel-compatible) for accountants.
- Add a small **profitability summary widget** to the existing admin dashboard.
- Handle pre-Phase-C orders (no `unitCostCents`) gracefully — surface them as "Náklady nesledované" rather than zero-cost.
- Performance: every report renders under 2s on the current order volume; degrade gracefully as the dataset grows.

## Non-goals

- Net profit (overhead, salaries, rent, utilities). Phase E is **gross margin only**: revenue minus product cost. Operating expenses are a Phase 4/6 concern in the ERP roadmap.
- Forecasting / trend prediction.
- Multi-currency.
- Tax / VAT decomposition. Reports use the values already stored on `order_items.price` and `unitCostCents` — whatever convention the project uses (gross or net) is preserved.
- Custom report builder. Phase E ships a fixed set of canned reports.
- Real-time streaming. Reports are point-in-time queries with caching, not live dashboards.
- Backfill of pre-Phase-C order costs (would be misleading — recipe + ingredient prices have changed).

---

## Prerequisites

- Phase A pre-A scaffolding — `order_items.unitCostCents` column exists, `requireReportsView` guard, `reports` logger namespace.
- Phase C — `order_items.unitCostCents` is being **populated** at order creation. (The column exists since Phase A; Phase C is the first writer.)
- Phase B — `ingredient_price_history` populated with the lossless cents/kg storage. See [arc overview §3](./_arc-overview.md#3-pricing-model-canonical).
- Phases A and D are not strictly required but most reports become more interesting with the full data.

---

## What to build

### 1. Schema changes

**Default: none.** All reports are computed from existing tables (`orders`, `order_items`, `products`, `stores`, `categories`, `ingredients`, `ingredient_price_history`).

**Optional (off by default):** a single materialized-aggregates table for daily snapshots. Recommended only when the read query starts to drag. Spec it now so the migration is ready when the day comes:

```typescript
// Disabled by feature flag REPORTS_DAILY_SNAPSHOT until needed
export const orderDailySnapshots = pgTable(
  "order_daily_snapshots",
  {
    id: text("id").primaryKey().$defaultFn(() => createPrefixedId("ods")),
    day: date("day").notNull(),                    // YYYY-MM-DD
    storeId: text("store_id").references(() => stores.id, { onDelete: "set null" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    quantity: integer("quantity").notNull(),
    revenueCents: integer("revenue_cents").notNull(),
    costCents: integer("cost_cents"),              // null when any underlying row had null unitCostCents
    orderCount: integer("order_count").notNull(),
    computedAt: timestamp("computed_at").defaultNow().notNull(),
  },
  (t) => [
    unique("ods_day_store_product").on(t.day, t.storeId, t.productId),
    index("idx_ods_day").on(t.day),
    index("idx_ods_store_day").on(t.storeId, t.day),
  ]
);
```

Populated by a nightly cron action (Vercel Cron or similar). Off in Phase E unless reports start timing out — flag it in the spec rather than building speculatively.

---

### 2. Reports feature module: `src/features/reports/`

```
src/features/reports/
├── api/
│   ├── queries.ts                  # all SQL aggregations
│   └── exports.ts                  # CSV serialization
├── components/
│   ├── reports-shell.tsx           # shared layout (header, date-range, store filter)
│   ├── period-picker.tsx           # date range with presets (7d / 30d / 90d / MTD / custom)
│   ├── store-filter.tsx
│   ├── store-pl-table.tsx
│   ├── product-pl-table.tsx
│   ├── ingredient-trends-chart.tsx
│   ├── ingredient-impact-list.tsx
│   ├── margin-distribution-chart.tsx
│   ├── kpi-card.tsx                # tržby / náklady / marža summary cards
│   ├── period-comparison-row.tsx   # current vs previous period chips
│   └── dashboard-profit-widget.tsx # used on /admin landing page
└── lib/
    ├── period.ts                   # parsing/normalizing date-range params
    ├── format.ts                   # margin %, deltas, formatPrice integration
    └── constants.ts                # INCLUDED_ORDER_STATUSES etc.
```

#### `lib/constants.ts`

```typescript
import type { OrderStatus } from "@/db/types";

// Orders that count toward revenue + cost. Cancelled/refunded excluded.
export const PROFIT_ORDER_STATUSES: OrderStatus[] = [
  "new", "in_progress", "ready_for_pickup", "completed",
];

export const PERIOD_PRESETS = ["7d", "30d", "90d", "mtd", "ytd", "custom"] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
```

`PROFIT_ORDER_STATUSES` is the project's default for "what counts as a sale." If business wants to exclude `new` and `in_progress` (uncompleted) the array is the single place to change. Document this.

#### `api/queries.ts`

All queries `"use cache"` with `cacheLife("hours")` and tagged `reports` plus a per-report scope. Re-cached automatically on order writes via the existing `orders` tag — extend `revalidateTag("reports")` calls to the order creation paths in Phase E (one-line change in `create-b2c-order.ts`).

| Query | Inputs | Returns | Tags |
|---|---|---|---|
| `getStoreProfitability(period, opts: { storeIds?, segment? })` | date range + optional store filter (multi-store) + B2C/B2B segment | `Array<{ storeId, storeName, revenueCents, costCents, marginCents, marginPct, orderCount, untrackedCostOrderCount }>` | `reports`, `reports-stores` |
| `getProductProfitability(period, opts: { storeIds?, categoryId?, minOrders?, segment? })` | date range + filters | `Array<{ productId, productName, categoryName, quantitySold, revenueCents, costCents, marginCents, marginPct }>` | `reports`, `reports-products` |
| `getIngredientPriceTrends(ingredientId, period)` | one ingredient + date range | `Array<{ effectiveFrom, pricePerKgCents \| null, pricePerPieceCents \| null, deltaPct }>` | `reports`, `reports-ingredients-${ingredientId}` |
| `getIngredientImpact(ingredientId)` | one ingredient | `Array<{ recipeId, recipeName, products: Array<{ productId, productName, contributionPctOfCost }> }>` | `reports`, `reports-ingredient-impact-${ingredientId}` |
| `getMarginDistribution(period, opts: { storeIds?, segment? })` | date range | bucketed counts: `{ negative, 0to10, 10to30, 30to50, over50 }` | `reports`, `reports-distribution` |
| `getProfitabilitySummary(period, opts: { storeIds?, segment? })` | date range | `{ revenueCents, costCents, marginCents, marginPct, untrackedShare }` for the dashboard widget | `reports`, `reports-summary` |
| `getProfitabilityComparison(period, opts: { storeIds?, segment? })` | date range | `{ current, previous }` summaries for period-over-period | `reports`, `reports-summary` |

All queries gated to `requireReportsView()` at the page level; queries themselves are pure read functions.

**Filter shape future-proofing:** every query accepts `storeIds?: string[]` and `segment?: 'b2c' | 'b2b' | 'all'` from day one. Phase E doesn't enforce per-staff store scoping (UI exposes all stores). When Phase 4 introduces store-staff assignments, the `requireReportsView` guard returns the staff member's permitted store IDs, and the page automatically passes them to every query. Zero query-signature changes at that point. Same logic for `segment` once B2B orders launch.

#### Sample SQL (store P&L)

The shape that drives the rest of the queries:

```sql
SELECT
  o.store_id,
  s.name AS store_name,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(oi.price * oi.quantity) AS revenue_cents,
  SUM(oi.unit_cost_cents * oi.quantity) FILTER (WHERE oi.unit_cost_cents IS NOT NULL) AS cost_cents,
  COUNT(DISTINCT o.id) FILTER (WHERE oi.unit_cost_cents IS NULL) AS untracked_cost_order_count
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN stores s ON s.id = o.store_id
WHERE o.created_at >= $1
  AND o.created_at < $2
  AND o.order_status = ANY($3)            -- PROFIT_ORDER_STATUSES
  AND ($4::text[] IS NULL OR o.store_id = ANY($4))
GROUP BY o.store_id, s.name
ORDER BY revenue_cents DESC NULLS LAST;
```

Key patterns reused across queries:
- **`FILTER (WHERE oi.unit_cost_cents IS NOT NULL)`** so NULL costs don't poison the SUM. The complementary count surfaces how much of the period is "untracked".
- **Status filter** uses the constant array, parameterized.
- **NULL-safe store** because `orders.storeId` may be null (existing schema choice).

In Drizzle, written via `sql` tagged template + `.execute()` for the FILTER aggregate (Drizzle's query builder doesn't express `FILTER` cleanly).

---

### 3. Routes

#### `/admin/reports` — index

`src/app/(admin)/admin/reports/page.tsx`

Server component, `requireStaff()`. Lists the available reports as cards with a one-line description and a CTA button. Three cards in Phase E:
- "Ziskovosť predajní" → `/admin/reports/profitability/stores`
- "Ziskovosť produktov" → `/admin/reports/profitability/products`
- "Trendy cien surovín" → `/admin/reports/ingredients`

Top of the page: KPI strip showing the last-30-days summary (`getProfitabilitySummary`) so the index is informative on its own.

#### `/admin/reports/profitability/stores`

Server component. Uses `<ReportsShell>` to host the period picker + store filter. Renders:
- KPI cards: total revenue, total cost, total margin, margin %
- Period comparison row (current vs previous identical-length period)
- `<StorePLTable>` — sortable, columns: store, orders, revenue, cost, margin, margin %, untracked cost orders
- "Stiahnuť CSV" button → calls export action with current filters

Empty state: "V zvolenom období neboli žiadne objednávky." No errors for sparse data.

#### `/admin/reports/profitability/products`

Same shell. Renders:
- KPI strip
- `<MarginDistributionChart>` — histogram showing how many products fall in each margin bucket (negative / 0-10% / 10-30% / 30-50% / >50%)
- `<ProductPLTable>` — paginated, default sort by margin asc (worst first), filters: category, store, "min predajov" (hide products with very low volume to reduce noise)

#### `/admin/reports/ingredients`

`src/app/(admin)/admin/reports/ingredients/page.tsx` lists every ingredient with most-recent price + delta from previous price. Click → `/admin/reports/ingredients/[id]`:
- Period picker
- `<IngredientTrendsChart>` — line chart of price over time (`getIngredientPriceTrends`)
- `<IngredientImpactList>` — for the current price, every recipe that uses this ingredient + the share of recipe cost it represents + the linked products

This page is the "what happens if our supplier raises flour prices" tool. Without it, ingredient cost changes are invisible to non-technical staff.

---

### 4. Components

#### `<ReportsShell>`

Wraps every report page. Provides header (title, breadcrumb), period picker, store filter, action buttons (CSV export, refresh).

State lives in URL search params (`?from=2026-01-01&to=2026-01-31&storeId=...`) so reports are linkable and the back button works. Server components read `searchParams` directly; client component only handles navigation.

#### `<PeriodPicker>`

`"use client"`. Presets row (7d / 30d / 90d / MTD / YTD / Custom). Custom opens a calendar `<Popover>` with two-date selection. Default: last 30 days. Writes to URL via `router.push()`.

Calendar uses the existing `<Calendar>` shadcn component (date-fns under the hood, which the project already standardizes on).

#### `<KPICard>`

Single-metric card with optional delta vs previous period:

```
┌──────────────────────┐
│ Tržby                │
│ 12 480 €             │
│ ▲ 8,2 % vs predchádz.│
└──────────────────────┘
```

Delta direction is colored (green up / red down) but kept subdued — accounting reports get loud quickly otherwise.

#### `<StorePLTable>` / `<ProductPLTable>`

Both built on shadcn `DataTable`. Sortable columns, server-side sorting (URL params for column + direction). No client-side filtering — the URL is the source of truth.

Margin column shows both absolute (€) and percentage. Margin % is colored on a three-tier scale: red (< 10%), amber (10-30%), green (≥ 30%). Thresholds in `lib/constants.ts` for easy tweaking.

A tooltip on the "Untracked cost orders" count explains: "X objednávok bolo vytvorených pred zavedením sledovania nákladov a do nákladov sa nepočítajú."

#### Charts

- `<IngredientTrendsChart>` — line chart, recharts (consistent with Tremor / shadcn chart conventions). X axis: date, Y axis: price/base unit in EUR.
- `<MarginDistributionChart>` — bar chart, 5 bins.

If the project doesn't already have a chart primitive, use the shadcn `<ChartContainer>` from `src/components/ui/chart.tsx` (recharts-based).

#### `<DashboardProfitWidget>`

Drop-in card for the existing admin dashboard at `/admin`. Shows the last-30-days profitability summary using `getProfitabilitySummary` + a small sparkline of daily margin. One CTA: "Otvoriť reporty →".

This is the entry point — admins shouldn't have to navigate to "Reports" to see whether the bakery made money this month.

---

### 5. CSV export

#### `api/exports.ts`

```typescript
export async function exportStoreProfitabilityCsv(period: Period, storeIds?: string[]): Promise<string>;
export async function exportProductProfitabilityCsv(period: Period, opts: ProductFilters): Promise<string>;
```

Each function:
1. Calls the corresponding query
2. Serializes to CSV with semicolon delimiter (Slovak Excel default), UTF-8 BOM prefix (so `Č/Š/Ž` render correctly in Excel)
3. Returns the CSV string

#### Export endpoint

`src/app/api/admin/reports/export/route.ts` — GET handler that:
1. `requireStaff()` (server-side guard, not just a UI button)
2. Reads `?report=stores|products` + period + filters
3. Calls the appropriate export function
4. Returns `Response` with `Content-Type: text/csv; charset=utf-8` and a `Content-Disposition: attachment; filename="reporty-predajne-2026-05-01_2026-05-31.csv"` header

Date-range and store IDs in the filename so downloads don't collide. Filename is human-readable (Slovak diacritics-free).

Excel doesn't open `.xlsx` from a CSV. If a true Excel file becomes a requirement later, the project already documents `xlsx` as the lazy-loaded library option in `CLAUDE.md`.

---

### 6. Caching strategy

| Tag | Set by | Invalidated by |
|---|---|---|
| `reports` | All report queries | Order creation, order status change, ingredient price update, recipe edit |
| `reports-summary` | `getProfitabilitySummary` | Same as `reports` |
| `reports-stores` | `getStoreProfitability` | Same |
| `reports-products` | `getProductProfitability` | Same |
| `reports-ingredients-${id}` | `getIngredientPriceTrends` | Ingredient price update |
| `reports-ingredient-impact-${id}` | `getIngredientImpact` | Recipe edit, ingredient price update |
| `reports-distribution` | `getMarginDistribution` | Order creation, recipe edit |

`cacheLife("hours")` everywhere — reports change rarely, and reports rendering inside an admin context tolerates a small staleness window. If business requests "real-time," tighten to `cacheLife("minutes")` selectively.

The order creation action (`src/features/orders/actions/create-b2c-order.ts`) gets `revalidateTag("reports")` appended to its existing tag list. Same for order status changes and (where Phase B/C don't already do so) ingredient price updates.

---

### 7. Handling missing cost data

Three categories of orders need explicit handling:

1. **Pre-Phase-C orders** — `unitCostCents IS NULL` for every line. Excluded from cost SUM via `FILTER`. Counted into `untrackedCostOrderCount`. Surfaced to the user as a small note on every report: "Z dôvodu zavedenia sledovania nákladov v máji 2026 niektoré staršie objednávky neobsahujú dáta o nákladoch."

2. **Orders with mixed cost coverage** — some line items had a recipe at order time, some didn't. The cost SUM ignores the NULL lines but revenue still includes them. This makes margin % an underestimate for that order. Acceptable in aggregate; spec doesn't compensate.

3. **Cancelled / refunded orders** — excluded by `PROFIT_ORDER_STATUSES`. If business wants to see refund volume separately, add a Phase F report. Not in Phase E.

A small admin tool at `/admin/reports/diagnostics` (read-only) shows the breakdown:
- % of orders with full cost coverage
- % with partial coverage
- % with none

Useful when admins ask "why is margin % weird?" — points them at the data quality issue rather than the calculation.

---

### 8. Performance

Expected order volume (per project context: small bakery chain, several stores): < 1000 orders/day → < 365k orders/year. `order_items` ~5x that. PostgreSQL aggregations are fast at this scale. Existing indexes on `orders.created_at`, `orders.order_status`, `orders.store_id` cover the queries.

Two indexes worth verifying / adding (no schema migration if they already exist):

```sql
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON orders (order_status, created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_product
  ON order_items (order_id, product_id);
```

The first is the hot path for every report. The second supports the product-level join.

If a report ever exceeds 2s p95, the optional `order_daily_snapshots` table (Section 1) becomes the answer. Don't pre-optimize.

---

### 9. Admin nav + dashboard

- `src/app/(admin)/admin/_components/sidebar.tsx` — add a new top-level "Reporty" section with the three report links.
- `src/app/(admin)/admin/(dashboard)/page.tsx` — append `<DashboardProfitWidget>` to the existing dashboard layout.

Visible to `admin` and `manager`. Once the baker role exists (Phase 4), bakers do not see reports — production cost is sensitive operational data, not production-floor information.

---

## File summary

| Action | File |
|---|---|
| (Optional) Edit | `src/db/schema.ts` — `order_daily_snapshots` table behind feature flag (**human approval if enabled**) |
| Create | `src/features/reports/api/queries.ts` |
| Create | `src/features/reports/api/exports.ts` |
| Create | `src/features/reports/lib/period.ts` |
| Create | `src/features/reports/lib/format.ts` |
| Create | `src/features/reports/lib/constants.ts` |
| Create | `src/features/reports/components/reports-shell.tsx` |
| Create | `src/features/reports/components/period-picker.tsx` |
| Create | `src/features/reports/components/store-filter.tsx` |
| Create | `src/features/reports/components/store-pl-table.tsx` |
| Create | `src/features/reports/components/product-pl-table.tsx` |
| Create | `src/features/reports/components/ingredient-trends-chart.tsx` |
| Create | `src/features/reports/components/ingredient-impact-list.tsx` |
| Create | `src/features/reports/components/margin-distribution-chart.tsx` |
| Create | `src/features/reports/components/kpi-card.tsx` |
| Create | `src/features/reports/components/period-comparison-row.tsx` |
| Create | `src/features/reports/components/dashboard-profit-widget.tsx` |
| Create | `src/app/(admin)/admin/reports/page.tsx` |
| Create | `src/app/(admin)/admin/reports/profitability/stores/page.tsx` |
| Create | `src/app/(admin)/admin/reports/profitability/products/page.tsx` |
| Create | `src/app/(admin)/admin/reports/ingredients/page.tsx` |
| Create | `src/app/(admin)/admin/reports/ingredients/[id]/page.tsx` |
| Create | `src/app/(admin)/admin/reports/diagnostics/page.tsx` |
| Create | `src/app/api/admin/reports/export/route.ts` |
| Edit | `src/features/orders/actions/create-b2c-order.ts` — add `revalidateTag("reports")` |
| Edit | `src/features/orders/api/actions.ts` (status change) — add `revalidateTag("reports")` |
| Edit | `src/features/ingredients/api/actions.ts` — add `revalidateTag("reports")` on price changes |
| Edit | `src/features/recipes/api/actions.ts` — add `revalidateTag("reports")` on recipe item edits |
| Edit | `src/app/(admin)/admin/_components/sidebar.tsx` — "Reporty" nav section |
| Edit | `src/app/(admin)/admin/(dashboard)/page.tsx` — mount `<DashboardProfitWidget>` |
| Verify | indexes `idx_orders_status_created_at`, `idx_order_items_order_product` exist; add migration if missing |
| Edit | `docs/database-schema.md` — note the indexes (and snapshots table if enabled) |
| Edit | `docs/features-catalog.json` — new `reports` feature, update `lastUpdated` |
| Edit | `CLAUDE.md` — note the Reports module under feature modules list |

---

## Constraints

- **No `db.transaction()`** — Phase E is read-only; not a concern.
- **No barrel files** — direct imports.
- **No dynamic imports of internal modules** — recharts is third-party, fine to static-import.
- **Slovak language** for user-facing text; code in English.
- **`requireReportsView()`** on every page and the export route (admin + manager; bakers do not see reports). Resource-scoped guard from pre-A scaffolding. See [arc overview §4](./_arc-overview.md#4-role-matrix).
- **Schema changes require human approval** before editing `src/db/schema.ts` (only relevant if the optional snapshots table is enabled).
- **No `pnpm db:push`** — generate + migrate.
- **Money in cents**, **margin % to 1 decimal**, EUR-only.
- **Structured logging** via `log.reports.error()` — add new module logger.
- **`cacheLife("hours")` + `cacheTag()`** on all queries; mutations across orders/ingredients/recipes invalidate via `revalidateTag("reports")`.

---

## Open questions / decisions to lock

1. **Net vs gross prices.** Reports use whatever's stored on `order_items.price` and `unitCostCents`. Confirm whether these are gross (incl. VAT) or net so the labels match. If they differ, a single divisor in `lib/format.ts` solves it. (Decision is held centrally in [arc overview §12.1](./_arc-overview.md#12-open-questions-kept-here-so-phase-specs-dont-drift).)
2. **Status set for "counts as a sale."** Default per [arc overview §12.4](./_arc-overview.md#12-open-questions-kept-here-so-phase-specs-dont-drift): `PROFIT_ORDER_STATUSES = ["new", "in_progress", "ready_for_pickup", "completed"]`.
3. **Refunds reporting.** Phase E excludes `cancelled`/`refunded`. A separate "Refundy" report (or a column on the store P&L table) is a cheap add — flag for Phase F.
4. **Snapshot table opt-in trigger.** Recommend enabling `order_daily_snapshots` only when a report exceeds 2s p95 in observed admin usage. Premature now.
5. **Comparison period semantics.** Period-over-period default: identical-length window immediately before. Year-over-year would also be useful but doubles the query count. Defer.
6. **Public-facing margin display.** Never. Costs and margins are internal-only. Reports are admin-route exclusive.
7. **B2B vs B2C split.** Query signatures already accept `segment` (see the filter shape future-proofing above). UI exposes it once B2B order creation launches; until then, `segment` defaults to `'all'` and silently means "B2C only" because that's all that exists.

---

## Performance notes

- Expected p95 query time on current dataset: < 500ms for store P&L, < 1s for product P&L, < 200ms for summary widget. Margins will erode as the orders table grows; revisit at 100k+ orders/month.
- CSV export streams the full result; no pagination. At expected volumes (max ~5000 product rows for a year of data), this is fine. If it ever balloons, swap to a streamed `Response` body.
- `cacheLife("hours")` means the dashboard widget could be up to an hour stale. Acceptable. Tighten only if business asks.
- Recharts is a 70 KB-ish addition if the project doesn't already use it. Worth it; lighter alternatives (uplot, observable plot) trade ergonomics. Stick with the shadcn-blessed default.

---

## Acceptance criteria

- [ ] `/admin/reports` index renders and shows last-30-days summary
- [ ] Store P&L report shows revenue, cost, margin, margin %, with period picker working across presets and custom range
- [ ] Product P&L report sorts by margin and supports category + store filters
- [ ] Ingredient trends chart renders for any ingredient with at least one price-history entry
- [ ] Ingredient impact list shows the recipes (and their products) that use a selected ingredient
- [ ] CSV export downloads with semicolon delimiter, UTF-8 BOM, Slovak filename
- [ ] Pre-Phase-C orders are excluded from cost SUMs but counted into the "untracked" tooltip
- [ ] Period-over-period delta shown on KPI cards, color-coded
- [ ] Dashboard widget mounts on `/admin`, links to reports
- [ ] Reports invalidate within seconds of an order being created / status changing
- [ ] All pages and the export route guarded by `requireStaff()`
- [ ] No barrel files; no dynamic imports of internal modules; structured logging via `log.reports`

---

## Out of scope

- Net profit / operating expenses / overhead allocation
- Forecasting / predictive analytics
- Multi-currency
- Custom report builder
- Real-time / streaming reports
- Cost backfill for pre-Phase-C orders
- B2B-segment-only reports (until B2B orders launch)
- Email / Slack digest of weekly margins (easy add later via cron)
- Per-staff-member productivity reports (different domain)
- VAT decomposition
