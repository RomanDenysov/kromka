import { db } from "@/db";

export function getUsers() {
  return db.query.users.findMany({
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

export function getUserById(id: string) {
  return db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, id),
    with: {
      orders: {
        orderBy: (order, { desc }) => [desc(order.createdAt)],
      },
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

export type User = Awaited<ReturnType<typeof getUserById>>;
export type UserList = Awaited<ReturnType<typeof getUsers>>;
