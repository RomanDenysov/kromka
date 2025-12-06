import "server-only";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
  carts,
  orderItems,
  orders,
  organizations,
  products,
  stores,
} from "@/db/schema";

const TOP_PRODUCTS_LIMIT = 5;

export type DashboardMetrics = {
  newOrdersCount: number;
  activeProductsCount: number;
  activeStoresCount: number;
  activeCompaniesCount: number;
  todaysRevenue: number;
};

export async function getOrdersCount(): Promise<number> {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "orders-count");
  return await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"))
    .then((res) => res[0]?.count ?? 0);
}
export async function getCartsCount(): Promise<number> {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "carts-count");
  return await db
    .select({ count: count() })
    .from(carts)
    .then((res) => res[0]?.count ?? 0);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "dashboard-metrics");
  const [
    newOrdersCount,
    activeProductsCount,
    activeStoresCount,
    activeCompaniesCount,
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

    // Count active companies (B2B)
    db
      .select({ count: count() })
      .from(organizations)
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
          sql`DATE(${orders.createdAt}) = CURRENT_DATE`
        )
      )
      .then((res) => res[0]?.total ?? 0),
  ]);

  return {
    newOrdersCount,
    activeProductsCount,
    activeStoresCount,
    activeCompaniesCount,
    todaysRevenue,
  };
}

export type OrderStatusDistributionResult = { status: string; count: number }[];

export async function getOrderStatusDistribution(): Promise<OrderStatusDistributionResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "order-status-distribution");
  return await db
    .select({
      status: orders.orderStatus,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.orderStatus)
    .then((res) => res.map((r) => ({ status: r.status, count: r.count ?? 0 })));
}

export type RevenueHistoryResult = { date: string; revenue: number }[];

export async function getRevenueHistory({
  days,
}: {
  days: number;
}): Promise<RevenueHistoryResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", `revenue-history-${days}`);

  // Краще: нехай БД робить всю роботу з датами
  const revenueHistory = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(
        Number
      ),
    })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "paid"),
        gte(
          orders.createdAt,
          sql`CURRENT_DATE - INTERVAL '${sql.raw(String(days))} days'`
        )
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  // Генерація повного діапазону дат теж в SQL
  const fullRange = await db.execute<{ date: string }>(
    sql`SELECT to_char(d::date, 'YYYY-MM-DD') as date 
        FROM generate_series(
          CURRENT_DATE - INTERVAL '${sql.raw(String(days - 1))} days',
          CURRENT_DATE,
          '1 day'
        ) d`
  );

  const revenueMap = new Map(revenueHistory.map((r) => [r.date, r.revenue]));

  return fullRange.rows.map((row) => ({
    date: row.date,
    revenue: revenueMap.get(row.date) ?? 0,
  }));
}

type TopProductsResult = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}[];

export async function getTopProducts(): Promise<TopProductsResult> {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "top-products");
  const topProducts = await db
    .select({
      id: products.id,
      name: products.name,
      quantity: sql<number>`sum(${orderItems.quantity})`.mapWith(Number),
      revenue:
        sql<number>`sum(${orderItems.quantity} * ${orderItems.price})`.mapWith(
          Number
        ),
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .groupBy(products.id, products.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(TOP_PRODUCTS_LIMIT)
    .then((res) =>
      res.map((p) => ({
        id: p.id ?? "",
        name: p.name ?? "Neznámy produkt",
        quantity: p.quantity ?? 0,
        revenue: p.revenue ?? 0,
      }))
    );

  return topProducts;
}

export type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];

export async function getRecentOrders() {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "recent-orders");
  return await db.query.orders.findMany({
    where: (order, { inArray: inArrayFn }) =>
      inArrayFn(order.orderStatus, [
        "new",
        "in_progress",
        "ready_for_pickup",
        "completed",
      ]),
    orderBy: [desc(orders.updatedAt)],
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
}

export async function getActiveCarts() {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard", "carts");
  return await db.query.carts.findMany({
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
}

export type RecentOrdersData = Awaited<ReturnType<typeof getRecentOrders>>;
export type ActiveCartsData = Awaited<ReturnType<typeof getActiveCarts>>;
