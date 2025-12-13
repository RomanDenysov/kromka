import {
  createLoader,
  parseAsIsoDate,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const dashboardSearchParams = {
  date: parseAsIsoDate.withDefault(new Date()),
  order: parseAsStringEnum([
    "new",
    "in_progress",
    "ready_for_pickup",
    "completed",
    "cancelled",
    "refunded",
  ]).withDefault("new"),
  paymentStatus: parseAsStringEnum([
    "pending",
    "paid",
    "failed",
    "refunded",
  ]).withDefault("pending"),
  store: parseAsString.withDefault(""),
  tab: parseAsStringEnum(["orders", "products"]).withDefault("orders"),
};

export const loadDashboardSearchParams = createLoader(dashboardSearchParams);

export type DashboardSearchParams = Awaited<
  ReturnType<typeof loadDashboardSearchParams>
>;
