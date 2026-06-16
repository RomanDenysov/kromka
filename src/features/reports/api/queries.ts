"use cache";

import { type SQL, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { PROFIT_ORDER_STATUSES } from "../lib/constants";
import type { Period } from "../lib/period";

const STATUS_LIST: SQL = sql.join(
  PROFIT_ORDER_STATUSES.map((s) => sql`${s}`),
  sql`, `
);

function storeFilter(storeIds: string[] | undefined): SQL {
  if (!storeIds || storeIds.length === 0) {
    return sql``;
  }
  const list = sql.join(
    storeIds.map((id) => sql`${id}`),
    sql`, `
  );
  return sql`AND o.store_id IN (${list})`;
}

export interface StoreProfitabilityRow {
  costCents: number | null;
  marginCents: number | null;
  marginPct: number | null;
  orderCount: number;
  revenueCents: number;
  storeId: string | null;
  storeName: string | null;
  untrackedCostOrderCount: number;
}

export interface ProductProfitabilityRow {
  categoryName: string | null;
  costCents: number | null;
  marginCents: number | null;
  marginPct: number | null;
  productId: string;
  productName: string;
  quantitySold: number;
  revenueCents: number;
}

export interface ProfitabilitySummary {
  costCents: number | null;
  /** Relative % change in cost vs the previous period. */
  costDeltaPct: number | null;
  marginCents: number | null;
  /** Relative % change in margin (€) vs the previous period. */
  marginDeltaPct: number | null;
  marginPct: number | null;
  /** Margin % change vs the previous period, in percentage points. */
  marginPctDeltaPp: number | null;
  orderCount: number;
  revenueCents: number;
  /** Relative % change in revenue vs the previous period. */
  revenueDeltaPct: number | null;
  untrackedShare: number;
}

interface FilterOpts {
  storeIds?: string[];
}

interface ProfitAggregate {
  costCents: number | null;
  orderCount: number;
  revenueCents: number;
  untrackedCount: number;
}

/** Raw revenue/cost aggregate for a single [from, to] window. */
async function aggregateProfit(
  from: Date,
  to: Date,
  filter: SQL
): Promise<ProfitAggregate> {
  const rows = await db.execute(sql`
    SELECT
      COALESCE(SUM(oi.price * oi.quantity), 0)::int AS revenue_cents,
      SUM(oi.unit_cost_cents * oi.quantity) FILTER (WHERE oi.unit_cost_cents IS NOT NULL)::int AS cost_cents,
      COUNT(DISTINCT o.id)::int AS order_count,
      COUNT(DISTINCT o.id) FILTER (WHERE oi.unit_cost_cents IS NULL)::int AS untracked_count
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.created_at >= ${from}
      AND o.created_at <= ${to}
      AND o.order_status IN (${STATUS_LIST})
      ${filter}
  `);

  const row = rows.rows[0] as
    | {
        revenue_cents: number;
        cost_cents: number | null;
        order_count: number;
        untracked_count: number;
      }
    | undefined;

  return {
    revenueCents: row?.revenue_cents ?? 0,
    costCents: row?.cost_cents ?? null,
    orderCount: row?.order_count ?? 0,
    untrackedCount: row?.untracked_count ?? 0,
  };
}

/** Signed relative change as a percent. Null when no comparable base. */
function relDeltaPct(
  current: number | null,
  previous: number | null
): number | null {
  if (current === null || previous === null || previous === 0) {
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function deriveMargin(agg: ProfitAggregate): {
  marginCents: number | null;
  marginPct: number | null;
} {
  const marginCents =
    agg.costCents === null ? null : agg.revenueCents - agg.costCents;
  const marginPct =
    marginCents === null || agg.revenueCents === 0
      ? null
      : (marginCents / agg.revenueCents) * 100;
  return { marginCents, marginPct };
}

/** Assemble a summary (with period-over-period deltas) from two windows. */
function buildSummary(
  current: ProfitAggregate,
  previous: ProfitAggregate
): ProfitabilitySummary {
  const { marginCents, marginPct } = deriveMargin(current);
  const { marginCents: prevMarginCents, marginPct: prevMarginPct } =
    deriveMargin(previous);

  const untrackedShare =
    current.orderCount > 0 ? current.untrackedCount / current.orderCount : 0;

  return {
    revenueCents: current.revenueCents,
    costCents: current.costCents,
    marginCents,
    marginPct,
    orderCount: current.orderCount,
    untrackedShare,
    revenueDeltaPct: relDeltaPct(current.revenueCents, previous.revenueCents),
    costDeltaPct: relDeltaPct(current.costCents, previous.costCents),
    marginDeltaPct: relDeltaPct(marginCents, prevMarginCents),
    marginPctDeltaPp:
      marginPct === null || prevMarginPct === null
        ? null
        : marginPct - prevMarginPct,
  };
}

/**
 * Total revenue / cost / margin for the period, with period-over-period
 * deltas. Powers the KPI strip on the reports and the per-store detail page
 * (pass `storeIds: [id]`).
 */
export async function getProfitabilitySummary(
  period: Period,
  opts: FilterOpts = {}
): Promise<ProfitabilitySummary> {
  cacheLife("hours");
  cacheTag("reports", "reports-summary", "orders");

  const filter = storeFilter(opts.storeIds);
  const [current, previous] = await Promise.all([
    aggregateProfit(period.from, period.to, filter),
    aggregateProfit(period.previousFrom, period.previousTo, filter),
  ]);

  return buildSummary(current, previous);
}

/**
 * Same shape as {@link getProfitabilitySummary} but scoped to one product.
 * Powers the KPI strip on the product detail page.
 */
export async function getProductProfitabilitySummary(
  period: Period,
  productId: string
): Promise<ProfitabilitySummary> {
  cacheLife("hours");
  cacheTag("reports", "reports-summary", "orders");

  const filter = sql`AND oi.product_id = ${productId}`;
  const [current, previous] = await Promise.all([
    aggregateProfit(period.from, period.to, filter),
    aggregateProfit(period.previousFrom, period.previousTo, filter),
  ]);

  return buildSummary(current, previous);
}

export async function getStoreProfitability(
  period: Period,
  opts: FilterOpts = {}
): Promise<StoreProfitabilityRow[]> {
  cacheLife("hours");
  cacheTag("reports", "reports-stores", "orders");

  const rows = await db.execute(sql`
    SELECT
      o.store_id,
      s.name AS store_name,
      COUNT(DISTINCT o.id)::int AS order_count,
      COALESCE(SUM(oi.price * oi.quantity), 0)::int AS revenue_cents,
      SUM(oi.unit_cost_cents * oi.quantity) FILTER (WHERE oi.unit_cost_cents IS NOT NULL)::int AS cost_cents,
      COUNT(DISTINCT o.id) FILTER (WHERE oi.unit_cost_cents IS NULL)::int AS untracked_count
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN stores s ON s.id = o.store_id
    WHERE o.created_at >= ${period.from}
      AND o.created_at <= ${period.to}
      AND o.order_status IN (${STATUS_LIST})
      ${storeFilter(opts.storeIds)}
    GROUP BY o.store_id, s.name
    ORDER BY revenue_cents DESC NULLS LAST
  `);

  return (
    rows.rows as Array<{
      store_id: string | null;
      store_name: string | null;
      order_count: number;
      revenue_cents: number;
      cost_cents: number | null;
      untracked_count: number;
    }>
  ).map((r) => {
    const marginCents =
      r.cost_cents === null ? null : r.revenue_cents - r.cost_cents;
    const marginPct =
      marginCents === null || r.revenue_cents === 0
        ? null
        : (marginCents / r.revenue_cents) * 100;
    return {
      storeId: r.store_id,
      storeName: r.store_name,
      orderCount: r.order_count,
      revenueCents: r.revenue_cents,
      costCents: r.cost_cents,
      marginCents,
      marginPct,
      untrackedCostOrderCount: r.untracked_count,
    };
  });
}

export async function getProductProfitability(
  period: Period,
  opts: FilterOpts & { minQuantity?: number } = {}
): Promise<ProductProfitabilityRow[]> {
  cacheLife("hours");
  cacheTag("reports", "reports-products", "orders");

  const minQty = opts.minQuantity ?? 0;
  const rows = await db.execute(sql`
    SELECT
      oi.product_id,
      COALESCE(p.name, oi.product_id) AS product_name,
      c.name AS category_name,
      SUM(oi.quantity)::int AS quantity_sold,
      COALESCE(SUM(oi.price * oi.quantity), 0)::int AS revenue_cents,
      SUM(oi.unit_cost_cents * oi.quantity) FILTER (WHERE oi.unit_cost_cents IS NOT NULL)::int AS cost_cents
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE o.created_at >= ${period.from}
      AND o.created_at <= ${period.to}
      AND o.order_status IN (${STATUS_LIST})
      ${storeFilter(opts.storeIds)}
    GROUP BY oi.product_id, p.name, c.name
    HAVING SUM(oi.quantity) >= ${minQty}
    ORDER BY revenue_cents DESC
    LIMIT 500
  `);

  return (
    rows.rows as Array<{
      product_id: string;
      product_name: string;
      category_name: string | null;
      quantity_sold: number;
      revenue_cents: number;
      cost_cents: number | null;
    }>
  ).map((r) => {
    const marginCents =
      r.cost_cents === null ? null : r.revenue_cents - r.cost_cents;
    const marginPct =
      marginCents === null || r.revenue_cents === 0
        ? null
        : (marginCents / r.revenue_cents) * 100;
    return {
      productId: r.product_id,
      productName: r.product_name,
      categoryName: r.category_name,
      quantitySold: r.quantity_sold,
      revenueCents: r.revenue_cents,
      costCents: r.cost_cents,
      marginCents,
      marginPct,
    };
  });
}
