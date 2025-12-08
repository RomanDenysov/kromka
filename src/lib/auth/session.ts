import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { auth } from "@/lib/auth/server";

export const getAuth = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return {
      session: null,
      user: null,
    } as const;
  }
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
    with: {
      store: true,
      members: {
        with: { organization: true },
      },
    },
  });

  return {
    session,
    user,
    store: user?.store ?? null,
    organization: user?.members?.[0]?.organization ?? null,
  } as const;
});

export type User = Awaited<ReturnType<typeof getAuth>>["user"];
