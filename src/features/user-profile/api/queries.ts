import { and, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { orderStatusEvents, orders } from "@/db/schema";

export async function getUserOrders(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders", `user-${userId}`);
  return await db.query.orders.findMany({
    where: eq(orders.createdBy, userId),
    with: {
      store: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: (order, { desc: d }) => [d(order.createdAt)],
  });
}

export async function getUserOrderById(userId: string, orderId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders", `user-${userId}`);
  return await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.createdBy, userId)),
    with: {
      store: true,
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
              priceCents: true,
            },
          },
        },
      },
      statusEvents: {
        orderBy: desc(orderStatusEvents.createdAt),
      },
    },
  });
}

export type UserOrdersList = Awaited<ReturnType<typeof getUserOrders>>;
export type UserOrder = UserOrdersList[number];
export type UserOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getUserOrderById>>
>;
