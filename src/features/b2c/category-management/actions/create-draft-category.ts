"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import type { CreateCategorySchema } from "../schema";

export async function createDraftCategory() {
  const draftCategory: CreateCategorySchema = {
    name: "New Category",
    slug: `${getSlug("new-category")}-${createShortId()}`,
    description: "New Category Description",
    isActive: false,
    sortOrder: 0,
  };

  const [category] = await db
    .insert(categories)
    .values(draftCategory)
    .returning({ id: categories.id });

  revalidatePath("/admin/b2c/categories" as Route);

  redirect(`/admin/b2c/categories/${category.id}` as Route);
}
