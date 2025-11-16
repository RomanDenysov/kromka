"use server";

import { eq } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { categorySchema } from "@/components/forms/schemas";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { Category } from "@/types/categories";

export async function updateCategory(id: string, data: Partial<Category>) {
  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    throw new Error("Nesprávne údaje");
  }
  try {
    await db
      .update(categories)
      .set(validatedFields.data)
      .where(eq(categories.id, id));

    revalidatePath(`/admin/b2c/categories/${id}`);

    return refresh();
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error("Failed to update category:", error);
    throw new Error("Nepodarilo sa aktualizovať kategóriu");
  }
}
