"use server";

import { signIn } from "@/lib/auth/client";

export async function providerLogin(provider: string, callbackURL: string) {
  await signIn.social({
    provider,
    callbackURL,
  });
}
