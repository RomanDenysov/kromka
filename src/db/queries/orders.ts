import "server-only";
import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import type { OrderSchema } from "@/validation/orders";

export const QUERIES = {
  ADMIN: {
    GET_ORDERS: async (filters?: {
      status?: OrderSchema["currentStatus"];
      channel?: "B2C" | "B2B";
      storeId?: string;
      companyId?: string;
      createdBy?: string;
    }) =>
      await db.query.orders.findMany({
        where: (order, { eq, and: andFn }) => {
          const conditions: SQL[] = [];
          if (filters?.status) {
            conditions.push(eq(order.currentStatus, filters.status));
          }
          if (filters?.channel) {
            conditions.push(eq(order.channel, filters.channel));
          }
          if (filters?.storeId) {
            conditions.push(eq(order.storeId, filters.storeId));
          }
          if (filters?.companyId) {
            conditions.push(eq(order.companyId, filters.companyId));
          }
          if (filters?.createdBy) {
            conditions.push(eq(order.createdBy, filters.createdBy));
          }
          return conditions.length > 0 ? andFn(...conditions) : undefined;
        },
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
                  sku: true,
                },
              },
            },
          },
          statusEvents: {
            orderBy: (event, { desc }) => [desc(event.createdAt)],
            with: {
              author: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          payments: {
            with: {
              refunds: true,
            },
          },
        },
        orderBy: (order, { desc }) => [desc(order.createdAt)],
      }),

    GET_ORDER_BY_ID: async (id: string) =>
      await db.query.orders.findFirst({
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
                  sku: true,
                },
              },
            },
          },
          statusEvents: {
            orderBy: (event, { desc }) => [desc(event.createdAt)],
            with: {
              author: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          payments: {
            with: {
              refunds: true,
            },
          },
        },
      }),

    GET_ORDER_BY_NUMBER: async (orderNumber: string) =>
      await db.query.orders.findFirst({
        where: (order, { eq: eqFn }) => eqFn(order.orderNumber, orderNumber),
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
                  sku: true,
                },
              },
            },
          },
          statusEvents: {
            orderBy: (event, { desc }) => [desc(event.createdAt)],
            with: {
              author: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          payments: {
            with: {
              refunds: true,
            },
          },
        },
      }),

    GET_ORDER_ITEMS: async (orderId: string) =>
      await db.query.orderItems.findMany({
        where: (item, { eq: eqFn }) => eqFn(item.orderId, orderId),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      }),

    GET_ORDER_STATUS_EVENTS: async (orderId: string) =>
      await db.query.orderStatusEvents.findMany({
        where: (event, { eq: eqFn }) => eqFn(event.orderId, orderId),
        orderBy: (event, { desc }) => [desc(event.createdAt)],
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),

    GET_ORDER_PAYMENTS: async (orderId: string) =>
      await db.query.orderPayments.findMany({
        where: (payment, { eq: eqFn }) => eqFn(payment.orderId, orderId),
        with: {
          refunds: true,
        },
        orderBy: (payment, { desc }) => [desc(payment.createdAt)],
      }),
  },
};
