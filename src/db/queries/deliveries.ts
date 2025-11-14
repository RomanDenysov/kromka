import "server-only";
import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import type { DeliverySchema } from "@/validation/deliveries";

export const QUERIES = {
  ADMIN: {
    GET_DELIVERIES: async (filters?: {
      status?: DeliverySchema["status"];
      orderId?: string;
    }) =>
      await db.query.deliveries.findMany({
        where: (delivery, { eq, and: andFn }) => {
          const conditions: SQL[] = [];
          if (filters?.status) {
            conditions.push(eq(delivery.status, filters.status));
          }
          if (filters?.orderId) {
            conditions.push(eq(delivery.orderId, filters.orderId));
          }
          return conditions.length > 0 ? andFn(...conditions) : undefined;
        },
        with: {
          order: {
            columns: {
              id: true,
              orderNumber: true,
              currentStatus: true,
            },
          },
        },
        orderBy: (delivery, { desc }) => [desc(delivery.createdAt)],
      }),

    GET_DELIVERY_BY_ID: async (id: string) =>
      await db.query.deliveries.findFirst({
        where: (delivery, { eq: eqFn }) => eqFn(delivery.id, id),
        with: {
          order: {
            columns: {
              id: true,
              orderNumber: true,
              currentStatus: true,
            },
          },
        },
      }),

    GET_DELIVERY_BY_ORDER_ID: async (orderId: string) =>
      await db.query.deliveries.findFirst({
        where: (delivery, { eq: eqFn }) => eqFn(delivery.orderId, orderId),
        with: {
          order: {
            columns: {
              id: true,
              orderNumber: true,
              currentStatus: true,
            },
          },
        },
      }),
  },
};
