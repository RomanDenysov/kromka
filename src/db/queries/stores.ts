import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        with: {
          image: true,
          members: {
            with: {
              user: true,
            },
          },
          orders: {
            where: (order, { not, eq: eqFn }) =>
              not(eqFn(order.orderStatus, "cart")),
          },
        },
        orderBy: (store, { asc }) => [asc(store.name)],
      }),
    GET_STORE_BY_ID: async (id: string) =>
      await db.query.stores.findFirst({
        where: (store, { eq: eqFn }) => eqFn(store.id, id),
        with: {
          image: true,
          members: true,
        },
      }),
    GET_STORE_MEMBERS: async () => await db.query.storeMembers.findMany(),
  },
  PUBLIC: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        where: (store, { eq: eqFn }) => eqFn(store.isActive, true),
        with: {
          image: true,
          members: true,
        },
      }),
    GET_USER_STORE: async (userId: string) => {
      const userStore = await db.query.storeMembers.findFirst({
        where: (storeMember, { eq: eqFn }) => eqFn(storeMember.userId, userId),
        with: {
          store: {
            with: {
              image: true,
            },
          },
        },
      });
      return userStore?.store ?? null;
    },
    GET_STORE_BY_SLUG: async (slug: string) =>
      await db.query.stores.findFirst({
        where: (store, { eq: eqFn }) => eqFn(store.slug, slug),
        with: {
          image: true,
          members: true,
        },
      }),
  },
};
