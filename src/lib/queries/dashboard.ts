import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { carts, orders, products, stores } from "@/db/schema";

export type DashboardMetrics = {
  newOrdersCount: number;
  activeProductsCount: number;
  activeStoresCount: number;
  todaysRevenue: number;
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const [
    newOrdersCount,
    activeProductsCount,
    activeStoresCount,
    todaysRevenue,
  ] = await Promise.all([
    // Count new orders
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.orderStatus, "new"))
      .then((res) => res[0]?.count ?? 0),

    // Count active products
    db
      .select({ count: count() })
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.status, "active")))
      .then((res) => res[0]?.count ?? 0),

    // Count active stores
    db
      .select({ count: count() })
      .from(stores)
      .where(eq(stores.isActive, true))
      .then((res) => res[0]?.count ?? 0),

    // Sum revenue for paid orders created today
    db
      .select({
        total: sql<number>`sum(${orders.totalCents})`.mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          // Postgres specific date check
          sql`DATE(${orders.createdAt}) = CURRENT_DATE`
        )
      )
      .then((res) => res[0]?.total ?? 0),
  ]);

  return {
    newOrdersCount,
    activeProductsCount,
    activeStoresCount,
    todaysRevenue,
  };
};

export type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];

export const getRecentOrders = async (limit = 5) =>
  await db.query.orders.findMany({
    where: (order, { inArray: inArrayFn }) =>
      inArrayFn(order.orderStatus, [
        "new",
        "in_progress",
        "ready_for_pickup",
        "completed",
      ]),
    orderBy: [desc(orders.updatedAt)],
    limit,
    with: {
      createdBy: {
        columns: {
          name: true,
          email: true,
        },
      },
      store: {
        columns: {
          name: true,
        },
      },
      items: {
        with: {
          product: true,
        },
      },
    },
  });

export const getActiveCarts = async () =>
  await db.query.carts.findMany({
    orderBy: desc(carts.updatedAt),
    with: {
      items: {
        with: {
          product: {
            columns: {
              name: true,
            },
          },
        },
      },
      user: true,
      company: true,
    },
  });

export type RecentOrdersData = Awaited<ReturnType<typeof getRecentOrders>>;
export type ActiveCartsData = Awaited<ReturnType<typeof getActiveCarts>>;
