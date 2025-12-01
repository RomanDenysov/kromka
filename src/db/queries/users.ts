import "server-only";
import { db } from "@/db";

export const QUERIES = {
  PUBLIC: {
    GET_ME: async (userId: string) => {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
        with: {
          orders: true,
          storeMembers: true,
          members: {
            with: {
              organization: true,
            },
          },
          postComments: true,
          postLikes: true,
          posts: true,
          reviews: true,
          favorites: true,
          promoCodeUsages: true,
        },
      });

      return user;
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
