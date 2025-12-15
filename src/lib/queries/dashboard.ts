import "server-only";

import { format } from "date-fns";
import { and, count, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  carts,
  orderItems,
  orders,
  organizations,
  products,
  stores,
} from "@/db/schema";
import type { OrderStatus, PaymentStatus } from "@/db/types";

const TOP_PRODUCTS_LIMIT = 5;

export function getOrdersByPickupDate(
  date: string,
  filters?: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    storeId?: string;
  }
) {
  const where = and(
    eq(orders.pickupDate, date),
    ne(orders.orderStatus, "cancelled"),
    ...(filters?.orderStatus
      ? [eq(orders.orderStatus, filters.orderStatus)]
      : []),
    ...(filters?.paymentStatus
      ? [eq(orders.paymentStatus, filters.paymentStatus)]
      : []),
    ...(filters?.storeId ? [eq(orders.storeId, filters.storeId)] : [])
  );
  return db.query.orders.findMany({
    where,
    orderBy: desc(orders.createdAt),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
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

export function getProductsAggregateByPickupDate(
  date: string,
  storeId?: string
) {
  const baseConditions = [
    eq(orders.pickupDate, date),
    ne(orders.orderStatus, "cancelled"),
  ];
  if (storeId) {
    baseConditions.push(eq(orders.storeId, storeId));
  }
  return db
    .select({
      productId: products.id,
      productName: products.name,
      totalQuantity: sql<number>`sum(${orderItems.quantity})`.mapWith(Number),
      totalRevenue:
        sql<number>`sum(${orderItems.quantity} * ${orderItems.price})`.mapWith(
          Number
        ),
      orderCount: sql<number>`count(distinct ${orders.id})`.mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(and(...baseConditions))
    .groupBy(products.id, products.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`));
}

export function getMonthlyOrderStats(year: number, month: number) {
  const startDate = format(new Date(year, month, 1), "yyyy-MM-dd");
  const endDate = format(new Date(year, month + 1, 0), "yyyy-MM-dd");

  return db
    .select({
      date: orders.pickupDate,
      orderCount: count(),
      totalRevenue: sql<number>`sum(${orders.totalCents})`.mapWith(Number),
    })
    .from(orders)
    .where(
      and(
        gte(orders.pickupDate, startDate),
        lte(orders.pickupDate, endDate),
        ne(orders.orderStatus, "cancelled")
      )
    )
    .groupBy(orders.pickupDate);
}

export type MonthlyOrderStats = Awaited<
  ReturnType<typeof getMonthlyOrderStats>
>;

export type DashboardMetrics = {
  newOrdersCount: number;
  activeProductsCount: number;
  activeStoresCount: number;
  activeCompaniesCount: number;
  todaysRevenue: number;
};

export async function getOrdersCount(): Promise<number> {
  return await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"))
    .then((res) => res[0]?.count ?? 0);
}
export async function getCartsCount(): Promise<number> {
  return await db
    .select({ count: count() })
    .from(carts)
    .then((res) => res[0]?.count ?? 0);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
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
          ne(orders.orderStatus, "cancelled"),
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
        ne(orders.orderStatus, "cancelled"),
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

export type RevenueAndOrdersHistoryResult = {
  date: string;
  revenue: number;
  expectedRevenue: number;
  orderCount: number;
}[];

export async function getRevenueAndOrdersHistory({
  days,
}: {
  days: number;
}): Promise<RevenueAndOrdersHistoryResult> {
  const history = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      actualRevenue:
        sql<number>`COALESCE(sum(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.totalCents} ELSE 0 END), 0)`.mapWith(
          Number
        ),
      expectedRevenue:
        sql<number>`COALESCE(sum(${orders.totalCents}), 0)`.mapWith(Number),
      orderCount: count(),
    })
    .from(orders)
    .where(
      and(
        gte(
          orders.createdAt,
          sql`CURRENT_DATE - INTERVAL '${sql.raw(String(days))} days'`
        ),
        ne(orders.orderStatus, "cancelled")
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  // Generate full date range
  const fullRange = await db.execute<{ date: string }>(
    sql`SELECT to_char(d::date, 'YYYY-MM-DD') as date 
        FROM generate_series(
          CURRENT_DATE - INTERVAL '${sql.raw(String(days - 1))} days',
          CURRENT_DATE,
          '1 day'
        ) d`
  );

  const historyMap = new Map(
    history.map((h) => [
      h.date,
      {
        actualRevenue: h.actualRevenue,
        expectedRevenue: h.expectedRevenue,
        orderCount: h.orderCount,
      },
    ])
  );

  return fullRange.rows.map((row) => {
    const dayData = historyMap.get(row.date);
    return {
      date: row.date,
      revenue: dayData?.actualRevenue ?? 0,
      expectedRevenue: dayData?.expectedRevenue ?? 0,
      orderCount: dayData?.orderCount ?? 0,
    };
  });
}

type TopProductsResult = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}[];

export async function getTopProducts(): Promise<TopProductsResult> {
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
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(ne(orders.orderStatus, "cancelled"))
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

export function getRecentOrders() {
  return db.query.orders.findMany({
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
          id: true,
          name: true,
          email: true,
          phone: true,
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

export function getActiveCarts() {
  return db.query.carts.findMany({
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
export type ActiveCart = Awaited<ReturnType<typeof getActiveCarts>>[number];
