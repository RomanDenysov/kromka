"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuth } from "../auth/session";

export async function setUserStore(
  storeId: string
): Promise<{ success: boolean }> {
  const { user } = await getAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await db.update(users).set({ storeId }).where(eq(users.id, user.id));

  revalidatePath("/", "layout");

  return { success: true };
}
