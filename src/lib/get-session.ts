"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth/server";

// Cache session per request to avoid duplicate calls
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
