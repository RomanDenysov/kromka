"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export async function updateStoreStatusAction(id: string) {
  await requireAdmin();
  await db
    .update(stores)
    .set({ isActive: not(stores.isActive) })
    .where(eq(stores.id, id));

  revalidatePath("/admin/eshop");
  revalidatePath("/admin/eshop/stores");
  return;
}
