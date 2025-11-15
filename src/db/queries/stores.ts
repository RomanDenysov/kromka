import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_STORES: async () =>
      await db.query.stores.findMany({
        with: {
          image: true,
          members: true,
          orders: true,
        },
      }),
    GET_STORE_BY_ID: async () => await db.query.stores.findFirst(),
    GET_STORE_MEMBERS: async () => await db.query.storeMembers.findMany(),
  },
};
