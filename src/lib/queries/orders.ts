import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderStatusEvents, orders } from "@/db/schema";
import type { OrderStatus } from "@/db/types";

type OrderQueryConfig = NonNullable<
  Parameters<typeof db.query.orders.findFirst>[0]
>;

const orderRelations = {
  createdBy: {
    columns: { id: true, name: true, email: true, image: true, phone: true },
  },
  store: {
    columns: { id: true, name: true, slug: true },
  },
  company: {
    columns: { id: true, name: true, slug: true },
  },
  items: {
    with: {
      product: {
        columns: { id: true, name: true, slug: true, priceCents: true },
      },
    },
  },
  statusEvents: {
    orderBy: desc(orderStatusEvents.createdAt),
    with: { createdBy: true },
  },
} satisfies OrderQueryConfig["with"];

export function getAllOrders() {
  return db.query.orders.findMany({
    with: orderRelations,
    orderBy: desc(orders.createdAt),
  });
}

export function getOrderById(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: orderRelations,
  });
}

export function getOrderByStatus(status: OrderStatus) {
  return db.query.orders.findMany({
    where: eq(orders.orderStatus, status),
    with: orderRelations,
    orderBy: desc(orders.createdAt),
  });
}

export function getOrderByStore(storeId: string) {
  return db.query.orders.findMany({
    where: eq(orders.storeId, storeId),
    with: orderRelations,
    orderBy: desc(orders.createdAt),
  });
}

export async function getNewOrdersCount() {
  const [{ count: newOrdersCount }] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"));

  return newOrdersCount;
}

export type Order = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;
