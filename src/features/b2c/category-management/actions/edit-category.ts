"use server";

import { eq } from "drizzle-orm";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { UpdateCategorySchema } from "../schema";

export async function editCategory(categoryData: UpdateCategorySchema) {
  const { id, ...updateData } = categoryData;
  const [category] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });

  revalidatePath("/admin/b2c/categories" as Route);
  revalidatePath(`/admin/b2c/categories/${id}` as Route);

  return category;
}
