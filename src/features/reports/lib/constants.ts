import type { OrderStatus } from "@/db/types";

/**
 * Order statuses that count as a sale in profitability reports.
 * Cancelled and refunded orders are excluded. See arc overview §12.4.
 */
export const PROFIT_ORDER_STATUSES: readonly OrderStatus[] = [
  "new",
  "in_progress",
  "ready_for_pickup",
  "completed",
] as const;

/** Margin % bucket boundaries used by the distribution histogram. */
export const MARGIN_BUCKETS = [
  { label: "Strata", min: Number.NEGATIVE_INFINITY, max: 0 },
  { label: "0-10 %", min: 0, max: 10 },
  { label: "10-30 %", min: 10, max: 30 },
  { label: "30-50 %", min: 30, max: 50 },
  { label: "50 %+", min: 50, max: Number.POSITIVE_INFINITY },
] as const;

export const PERIOD_PRESETS = [
  "7d",
  "30d",
  "90d",
  "mtd",
  "ytd",
  "custom",
] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];
