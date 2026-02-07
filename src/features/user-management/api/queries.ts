import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";

export async function getUsers({
  limit = 50,
  offset = 0,
}: { limit?: number; offset?: number } = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("users");

  return db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      phone: true,
      role: true,
      createdAt: true,
      image: true,
    },
    orderBy: (user, { desc }) => [desc(user.createdAt)],
    with: {
      members: {
        with: {
          organization: true,
        },
      },
    },
    limit,
    offset,
  });
}

export async function getUserById(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("users", `user-${id}`);

  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    with: {
      orders: {
        orderBy: (order, { desc }) => [desc(order.createdAt)],
      },
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
}

export type User = Awaited<ReturnType<typeof getUserById>>;
export type UserList = Awaited<ReturnType<typeof getUsers>>;
