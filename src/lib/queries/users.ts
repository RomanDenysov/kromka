import { db } from "@/db";

export async function getUsers() {
  return await db.query.users.findMany({
    orderBy: (user, { desc }) => [desc(user.createdAt)],
    with: {
      orders: true,
      store: true,
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
  return await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    with: {
      orders: true,
      store: true,
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
