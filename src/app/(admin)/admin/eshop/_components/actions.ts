"use server";

import { eq, not } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export async function updateStoreStatusAction(id: string) {
  await requireAdmin();
  const [updatedStore] = await db
    .update(stores)
    .set({ isActive: not(stores.isActive) })
    .where(eq(stores.id, id))
    .returning({ id: stores.id, slug: stores.slug });

  if (updatedStore) {
    updateTag("stores");
    updateTag(`store-${updatedStore.slug}`);
  }

  revalidatePath("/admin/eshop");
  revalidatePath("/admin/eshop/stores");
}
