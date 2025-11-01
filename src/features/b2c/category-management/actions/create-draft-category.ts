"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function createDraftCategory() {
  try {
    const [category] = await db
      .insert(categories)
      .values({
        name: "New Category",
        slug: "new-category",
        description: "New Category Description",
        isActive: false,
        sortOrder: 0,
      })
      .returning({ id: categories.id });

    redirect(`/admin/b2c/categories/${category.id}` as Route);
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}
