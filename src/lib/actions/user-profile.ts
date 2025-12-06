"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuth } from "../auth/session";

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
 * For anonymous users we additionally update email so we can contact them.
 */
export async function updateCurrentUserProfile(
  input: UpdateCurrentUserProfileInput
): Promise<UpdateCurrentUserProfileResult> {
  const { user } = await getAuth();

  if (!user) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const isAnonymous = !!user.isAnonymous;

  const updateData: Partial<typeof users.$inferInsert> = {
    name: input.name,
    phone: input.phone,
  };

  if (isAnonymous) {
    updateData.email = input.email;
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
