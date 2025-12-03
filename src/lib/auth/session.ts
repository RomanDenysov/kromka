"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getRequiredSession() {
  const session = await getSession();
  if (!session || session.user.isAnonymous) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getRequiredUser() {
  const session = await getRequiredSession();
  return session.user;
}
