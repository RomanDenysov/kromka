import "server-only";
import { headers } from "next/headers";
import { db } from "@/db";
import { auth } from "@/lib/auth/server";

export const QUERIES = {
  PUBLIC: {
    GET_ME: async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user && !session?.user?.isAnonymous) {
        return session?.user;
      }

      return null;
    },
  },
  ADMIN: {
    GET_USERS: async () =>
      await db.query.users.findMany({
        orderBy: (user, { desc }) => [desc(user.createdAt)],
        with: {
          orders: true,
          storeMembers: true,
          members: {
            with: {
              organization: true,
            },
          },
        },
      }),
    GET_USER_BY_ID: async (id: string) =>
      await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, id),
        with: {
          orders: true,
          storeMembers: true,
          members: {
            with: {
              organization: true,
            },
          },
        },
      }),
  },
};
