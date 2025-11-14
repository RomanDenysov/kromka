import "server-only";

import { isNull, type SQL } from "drizzle-orm";
import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_PRICES: async (filters?: {
      productId?: string;
      channel?: "B2C" | "B2B";
      orgId?: string | null;
    }) =>
      await db.query.prices.findMany({
        where: (price, { eq, and: andFn }) => {
          const conditions: SQL[] = [];
          if (filters?.productId) {
            conditions.push(eq(price.productId, filters.productId));
          }
          if (filters?.channel) {
            conditions.push(eq(price.channel, filters.channel));
          }
          if (filters?.orgId !== undefined) {
            if (filters.orgId === null) {
              conditions.push(isNull(price.orgId));
            } else {
              conditions.push(eq(price.orgId, filters.orgId));
            }
          }
          return conditions.length > 0 ? andFn(...conditions) : undefined;
        },
        with: {
          product: true,
          organization: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: (price, { asc, desc }) => [
          desc(price.priority),
          asc(price.minQty),
        ],
      }),

    GET_PRICE_BY_ID: async (id: string) =>
      await db.query.prices.findFirst({
        where: (price, { eq }) => eq(price.id, id),
        with: {
          product: true,
          organization: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),

    GET_PRICES_BY_PRODUCT: async (productId: string) =>
      await db.query.prices.findMany({
        where: (price, { eq }) => eq(price.productId, productId),
        with: {
          organization: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: (price, { asc, desc }) => [
          desc(price.priority),
          asc(price.minQty),
        ],
      }),
  },
};
