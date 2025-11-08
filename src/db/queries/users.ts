import "server-only";

import { db } from "@/db";

export const QUERIES = {
  ADMIN: {
    GET_USERS: async () =>
      await db.query.users.findMany({
        orderBy: (user, { desc }) => [desc(user.createdAt)],
      }),
    GET_USER_BY_ID: async (id: string) =>
      await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, id),
      }),
  },
};
