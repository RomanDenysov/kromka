"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuth } from "@/lib/auth/session";

type UpdateProfileInput = {
  name: string;
  phone: string;
};

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const { user } = await getAuth();

    if (!user) {
      return { success: false, error: "Nie ste prihlásený" };
    }

    await db
      .update(users)
      .set({
        name: input.name,
        phone: input.phone || null,
      })
      .where(eq(users.id, user.id));

    revalidatePath("/profil");
    return { success: true };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error reporting
    console.error(error);
    return { success: false, error: "Nepodarilo sa aktualizovať profil" };
  }
}
