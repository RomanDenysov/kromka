import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        with: {
          image: true,
          orders: true,
          users: true,
        },
        orderBy: (store, { asc }) => [asc(store.name)],
      }),
    GET_STORE_BY_ID: async (id: string) =>
      await db.query.stores.findFirst({
        where: (store, { eq: eqFn }) => eqFn(store.id, id),
        with: {
          image: true,
          users: true,
        },
      }),
  },
  PUBLIC: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        where: (store, { eq: eqFn }) => eqFn(store.isActive, true),
        with: {
          image: true,
          users: true,
        },
      }),

    GET_STORE_BY_SLUG: async (slug: string) =>
      await db.query.stores.findFirst({
        where: (store, { eq: eqFn }) => eqFn(store.slug, slug),
        with: {
          image: true,
          users: true,
        },
      }),
  },
};
