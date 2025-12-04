"use server";

import { eq, inArray, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import type { CategorySchema } from "@/validation/categories";
import { getAuth } from "../auth/session";

export async function updateCategoryAction({
  id,
  category,
}: {
  id: string;
  category: CategorySchema;
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { id: _id, ...updateData } = category;

  await db.update(categories).set(updateData).where(eq(categories.id, id));

  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/admin/categories");

  return { success: true };
}

export async function createDraftCategoryAction() {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [newDraftCategory] = await db
    .insert(categories)
    .values({})
    .returning({ id: categories.id });

  revalidatePath(`/admin/categories/${newDraftCategory.id}`);
  revalidatePath("/admin/categories");

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
    .returning({ id: categories.id });

  revalidatePath(`/admin/categories/${newCategory.id}`);
  revalidatePath("/admin/categories");

  return { success: true, id: newCategory.id };
}

export async function toggleIsActiveCategoryAction({ id }: { id: string }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [updatedCategory] = await db
    .update(categories)
    .set({ isActive: not(categories.isActive) })
    .where(eq(categories.id, id))
    .returning({ id: categories.id });

  revalidatePath(`/admin/categories/${updatedCategory.id}`);
  revalidatePath("/admin/categories");

  return { success: true, id: updatedCategory.id };
}

export async function toggleIsActiveCategoriesAction({
  ids,
}: {
  ids: string[];
}) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const updatedCategories = await db
    .update(categories)
    .set({ isActive: not(categories.isActive) })
    .where(inArray(categories.id, ids))
    .returning({ id: categories.id });

  // TODO: DELETE IT AFTER RELEASE
  // biome-ignore lint/complexity/noForEach: We need to revalidate the paths for each category
  updatedCategories.forEach((category) => {
    revalidatePath(`/admin/categories/${category.id}`);
  });

  revalidatePath("/admin/categories");

  return {
    success: true,
    ids: updatedCategories.map((category) => category.id),
  };
}

export async function toggleIsFeaturedCategoryAction({ id }: { id: string }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const [updatedCategory] = await db
    .update(categories)
    .set({ isFeatured: not(categories.isFeatured) })
    .where(eq(categories.id, id))
    .returning({ id: categories.id });

  revalidatePath(`/admin/categories/${updatedCategory.id}`);
  revalidatePath("/admin/categories");

  return {
    success: true,
    id: updatedCategory.id,
  };
}

export async function deleteCategoriesAction({ ids }: { ids: string[] }) {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const deletedCategories = await db
    .delete(categories)
    .where(inArray(categories.id, ids))
    .returning({ id: categories.id });

  // TODO: DELETE IT AFTER RELEASE
  // biome-ignore lint/complexity/noForEach: We need to revalidate the paths for each category
  deletedCategories.forEach((category) => {
    revalidatePath(`/admin/categories/${category.id}`);
  });

  revalidatePath("/admin/categories");

  return {
    success: true,
    ids: deletedCategories.map((category) => category.id),
  };
}
