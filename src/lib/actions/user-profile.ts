"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/features/auth/guards";

type UpdateCurrentUserProfileInput = {
  name: string;
  email: string;
  phone: string;
  storeId?: string;
};

type UpdateCurrentUserProfileResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Update current user's profile with checkout customer data.
 * For authenticated users we update name + phone + storeId.
 * For anonymous users we additionally update email so we can contact them.
 */
export async function updateCurrentUserProfile(
  input: UpdateCurrentUserProfileInput
): Promise<UpdateCurrentUserProfileResult> {
  const user = await requireAuth();

  const updateData: Partial<typeof users.$inferInsert> = {
    name: input.name,
    phone: input.phone,
  };

  // Update storeId if provided and user doesn't have one set
  if (input.storeId && !user.storeId) {
    updateData.storeId = input.storeId;
  }

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
  } catch (error) {
    console.error(error);
    return { success: false, error: "Nepodarilo sa aktualizovať profil" };
  }
}
