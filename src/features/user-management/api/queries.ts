"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";

export async function getUsers() {
  cacheLife("minutes");
  cacheTag("users");

  return db.query.users.findMany({
    orderBy: (user, { desc }) => [desc(user.createdAt)],
    with: {
      orders: true,
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

export async function getUserById(id: string) {
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
