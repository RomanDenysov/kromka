"use server";

import { eq, inArray, not } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import { requireAdmin } from "@/lib/auth/guards";
import type { CategorySchema } from "@/lib/categories/types";

export async function updateCategoryAction({
  id,
  category,
}: {
  id: string;
  category: CategorySchema;
}) {
  await requireAdmin();

  const { id: _id, ...updateData } = category;

  // Check if slug is taken by another category
  if (updateData.slug) {
    const existingCategory = await db.query.categories.findFirst({
      where: (c, { and: andFn, eq: eqFn, ne }) =>
        andFn(eqFn(c.slug, updateData.slug as string), ne(c.id, id)),
      columns: { id: true },
    });

    if (existingCategory) {
      return { success: false, error: "SLUG_TAKEN" };
    }
  }

  const [updatedCategory] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning({ slug: categories.slug });

  // Invalidate public cache
  updateTag("categories");
  updateTag("products"); // Products depend on categories
  if (updatedCategory.slug) {
    updateTag(`category-${updatedCategory.slug}`);
  }

  return { success: true };
}

export async function createDraftCategoryAction() {
  await requireAdmin();

  const [newDraftCategory] = await db
    .insert(categories)
    .values({})
    .returning({ id: categories.id });

  // Invalidate public cache
  updateTag("categories");
  updateTag("products");

  redirect(`/admin/categories/${newDraftCategory.id}`);
}

export async function copyCategoryAction({ id }: { id: string }) {
  const referenceCategory = await db.query.categories.findFirst({
    where: (category, { eq: eqFn }) => eqFn(category.id, id),
  });

  if (!referenceCategory) {
    throw new Error("Category not found");
  }

  const newCategoryData = {
    name: referenceCategory.name,
    slug: draftSlug(referenceCategory.name),
    description: referenceCategory.description,
    isActive: false,
    sortOrder: referenceCategory.sortOrder,
  };

  const [newCategory] = await db
    .insert(categories)
    .values(newCategoryData)
    .returning({ id: categories.id, slug: categories.slug });

  // Invalidate public cache
  updateTag("categories");
  updateTag("products");
  if (newCategory.slug) {
    updateTag(`category-${newCategory.slug}`);
  }

  return { success: true, id: newCategory.id };
}

export async function toggleIsActiveCategoryAction({ id }: { id: string }) {
  await requireAdmin();

  const [updatedCategory] = await db
    .update(categories)
    .set({ isActive: not(categories.isActive) })
    .where(eq(categories.id, id))
    .returning({ id: categories.id, slug: categories.slug });

  // Invalidate public cache
  updateTag("categories");
  updateTag("products");
  if (updatedCategory.slug) {
    updateTag(`category-${updatedCategory.slug}`);
  }

  return { success: true, id: updatedCategory.id };
}

export async function toggleIsActiveCategoriesAction({
  ids,
}: {
  ids: string[];
}) {
  await requireAdmin();

  const updatedCategories = await db
    .update(categories)
    .set({ isActive: not(categories.isActive) })
    .where(inArray(categories.id, ids))
    .returning({ id: categories.id, slug: categories.slug });

  // Invalidate public cache
  updateTag("categories");
  updateTag("products");
  for (const category of updatedCategories) {
    if (category.slug) {
      updateTag(`category-${category.slug}`);
    }
  }

  return {
    success: true,
    ids: updatedCategories.map((category) => category.id),
  };
}

export async function toggleIsFeaturedCategoryAction({ id }: { id: string }) {
  await requireAdmin();

  const [updatedCategory] = await db
    .update(categories)
    .set({ isFeatured: not(categories.isFeatured) })
    .where(eq(categories.id, id))
    .returning({ id: categories.id, slug: categories.slug });

  // Invalidate public cache
  updateTag("categories");
  updateTag("featured");
  updateTag("products");
  if (updatedCategory.slug) {
    updateTag(`category-${updatedCategory.slug}`);
  }

  return {
    success: true,
    id: updatedCategory.id,
  };
}

export async function deleteCategoriesAction({ ids }: { ids: string[] }) {
  await requireAdmin();

  const deletedCategories = await db
    .delete(categories)
    .where(inArray(categories.id, ids))
    .returning({ id: categories.id, slug: categories.slug });

  // Invalidate public cache
  updateTag("categories");
  updateTag("products");
  for (const category of deletedCategories) {
    if (category.slug) {
      updateTag(`category-${category.slug}`);
    }
  }

  return {
    success: true,
    ids: deletedCategories.map((category) => category.id),
  };
}
