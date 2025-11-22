import "server-only";

import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import type { OrderStatus } from "../schema/orders";

export const QUERIES = {
  ADMIN: {
    GET_ORDERS: async (filters?: {
      status?: OrderStatus;
      storeId?: string;
      companyId?: string;
      createdBy?: string;
    }) =>
      await db.query.orders.findMany({
        where: (order, { eq, and: andFn }) => {
          const conditions: SQL[] = [];
          if (filters?.status) {
            conditions.push(eq(order.orderStatus, filters.status));
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
      }),

    GET_ORDER_ITEMS: async (orderId: string) =>
      await db.query.orderItems.findMany({
        where: (item, { eq: eqFn }) => eqFn(item.orderId, orderId),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      }),

    GET_ORDER_STATUS_EVENTS: async (orderId: string) =>
      await db.query.orderStatusEvents.findMany({
        where: (event, { eq: eqFn }) => eqFn(event.orderId, orderId),
        orderBy: (event, { desc }) => [desc(event.createdAt)],
        with: {
          createdBy: true,
        },
      }),
  },
  PUBLIC: {
    GET_CART: async (userId: string) => {
      const cart = await db.query.orders.findFirst({
        where: (order, { eq, and }) =>
          and(eq(order.orderStatus, "cart"), eq(order.createdBy, userId)),
        with: {
          items: {
            orderBy: (item, { asc }) => [asc(item.productId)],
            with: {
              product: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  priceCents: true,
                },
                with: {
                  images: {
                    with: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (cart) {
        for (const item of cart.items) {
          item.product.images = item.product.images.map((image) => ({
            ...image,
            url: image.media.url,
          }));
        }
      }

      const processedCart = {
        ...cart,
        items: cart?.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images.map((image) => ({
              url: image.media.url,
            })),
          },
        })),
      };

      return processedCart;
    },
  },
};
