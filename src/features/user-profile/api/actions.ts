"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/guards";

type UpdateCurrentUserProfileInput = {
  name: string;
  email: string;
  phone: string;
};

type UpdateCurrentUserProfileResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Update current user's profile with checkout customer data.
 * For authenticated users we update name + phone.
 */
export async function updateCurrentUserProfile(
  input: UpdateCurrentUserProfileInput
): Promise<UpdateCurrentUserProfileResult> {
  const user = await requireAuth();

  const updateData: Partial<typeof users.$inferInsert> = {
    name: input.name,
    phone: input.phone,
  };

  try {
    await db.update(users).set(updateData).where(eq(users.id, user.id));

    return { success: true } as const;
  } catch {
    return {
      success: false,
      error: "Nepodarilo sa uložiť údaje zákazníka",
    } as const;
  }
}

type UpdateProfileInput = {
  name: string;
  phone: string;
};

export async function updateProfileAction(input: UpdateProfileInput) {
  try {
    const user = await requireAuth();

    await db
      .update(users)
      .set({
        name: input.name,
        phone: input.phone || null,
      })
      .where(eq(users.id, user.id));

    revalidatePath("/profil");
    return { success: true };
  } catch {
    return { success: false, error: "Nepodarilo sa aktualizovať profil" };
  }
}
