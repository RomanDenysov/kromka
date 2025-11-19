import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        with: {
          image: true,
          members: true,
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
};
