"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";

export async function createDraftCategory() {
  const [category] = await db
    .insert(categories)
    .values({
      name: "New Category",
      slug: `${getSlug("new-category")}-${createShortId()}`,
      description: "New Category Description",
      isActive: false,
      sortOrder: 0,
    })
    .returning({ id: categories.id });

  redirect(`/admin/b2c/categories/${category.id}` as Route);
}
