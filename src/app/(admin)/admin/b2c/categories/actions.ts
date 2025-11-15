"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function createDraftCategory() {
  const [result] = await db
    .insert(categories)
    .values({})
    .returning({ id: categories.id });

  revalidatePath("/admin/b2c/categories");

  redirect(`/admin/b2c/categories/${result.id}`);
}
