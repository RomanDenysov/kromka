import "server-only";

import { format } from "date-fns";
import { and, count, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { carts, orderItems, orders, products } from "@/db/schema";
import type { OrderStatus, PaymentStatus } from "@/db/types";

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getOrdersByPickupDate(
  date: string,
  filters?: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    storeId?: string;
  }
) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

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

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getProductsAggregateByPickupDate(
  date: string,
  storeId?: string
) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders", "products");

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

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getMonthlyOrderStats(year: number, month: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("orders");

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

export async function getOrdersCount(): Promise<number> {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  return await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"))
    .then((res) => res[0]?.count ?? 0);
}

export async function getCartsCount(): Promise<number> {
  "use cache";
  cacheLife("minutes");
  cacheTag("carts");

  return await db
    .select({ count: count() })
    .from(carts)
    .then((res) => res[0]?.count ?? 0);
}

export type RecentOrder = Awaited<ReturnType<typeof getRecentOrders>>[number];

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getRecentOrders() {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

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

// biome-ignore lint/suspicious/useAwait: "use cache" directive requires async
export async function getActiveCarts() {
  "use cache";
  cacheLife("minutes");
  cacheTag("carts");

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
export type ActiveCart = Awaited<ReturnType<typeof getActiveCarts>>[number];
