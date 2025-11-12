import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        where: (store, { isNull: isNullFn }) => isNullFn(store.deletedAt),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          image: true,
          members: true,
          orders: true,
        },
      }),
    GET_STORE_BY_ID: async (id: string) =>
      await db.query.stores.findFirst({
        where: (store, { and: andFn, isNull: isNullFn, eq: eqFn }) =>
          andFn(isNullFn(store.deletedAt), eqFn(store.id, id)),
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          image: true,
          members: true,
          orders: true,
        },
      }),
    GET_STORE_MEMBERS: async (storeId: string) =>
      await db.query.storeMembers.findMany({
        where: (storeMember, { eq: eqFn }) =>
          eqFn(storeMember.storeId, storeId),
        with: {
          user: true,
        },
      }),
  },
};
