import { eq } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function getUserOrders(userId: string) {
  "use cache";
  cacheLife("minutes");
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
    orderBy: (order, { desc }) => [desc(order.createdAt)],
  });
}

export type UserOrdersList = Awaited<ReturnType<typeof getUserOrders>>;
export type UserOrder = UserOrdersList[number];
