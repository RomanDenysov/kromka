import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth/server";

export const getSession = cache(
  async () =>
    await auth.api.getSession({
      headers: await headers(),
    })
);

export const getUser = cache(async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
});

export const getUserDetails = cache(async () => {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      store: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      // TODO: Check what we need to get from members table
      members: {
        with: { organization: true },
      },
    },
  });
});

export type User = Awaited<ReturnType<typeof getUser>>;
export type UserDetails = Awaited<ReturnType<typeof getUserDetails>>;
