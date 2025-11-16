"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth/server";
import { ERROR_CODES } from "../errors";

export const getSession = cache(
  async () =>
    await auth.api.getSession({
      headers: await headers(),
    })
);

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getRole() {
  const session = await getSession();
  return session?.user?.role ?? null;
}

export const authRequired = async <T = unknown>(
  action: () => Promise<T>
): Promise<T | undefined> => {
  const session = await getSession();
  if (!session) {
    throw new Error(ERROR_CODES.UNAUTHORIZED);
  }
  return await action();
};
