"use server";

import { z } from "zod";
import { signIn } from "@/lib/auth/client";

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Zadajte platný email" })
    .min(1, "Email je povinný"),
});

export async function sendMagicLink(_: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const validated = emailSchema.safeParse({ email });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.email?.[0] };
  }
  await signIn.magicLink({ email, callbackURL: "/" });
  return { success: true };
}

export async function providerLogin(provider: string, callbackURL: string) {
  await signIn.social({
    provider,
    callbackURL,
  });
}
