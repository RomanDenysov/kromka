import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function getNewOrdersCount() {
  const [{ count: newOrdersCount }] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.orderStatus, "new"));

  return newOrdersCount;
}

export async function getAllOrders() {
  return await db.query.orders.findMany({
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      store: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      company: {
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
            },
          },
        },
      },
      statusEvents: {
        orderBy: (event, { desc }) => [desc(event.createdAt)],
        with: {
          createdBy: true,
        },
      },
    },
    orderBy: (order, { desc }) => [desc(order.createdAt)],
  });
}

export async function getOrderById(id: string) {
  return await db.query.orders.findFirst({
    where: (order, { eq: eqFn }) => eqFn(order.id, id),
    with: {
      createdBy: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      store: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      company: {
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
            },
          },
        },
      },
      statusEvents: {
        orderBy: (event, { desc }) => [desc(event.createdAt)],
        with: {
          createdBy: true,
        },
      },
    },
  });
}

export type AllOrdersList = Awaited<ReturnType<typeof getAllOrders>>;
export type Order = Awaited<ReturnType<typeof getOrderById>>;
