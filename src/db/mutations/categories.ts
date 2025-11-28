import "server-only";

import { eq, inArray, not } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import type { UpdateCategorySchema } from "@/validation/categories";

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_CATEGORY: async (_userId: string) => {
      const [newDraftCategory] = await db
        .insert(categories)
        .values({})
        .returning({ id: categories.id });

      return { id: newDraftCategory.id };
    },
    UPDATE_CATEGORY: async (id: string, category: UpdateCategorySchema) => {
      const [updatedCategory] = await db
        .update(categories)
        .set(category)
        .where(eq(categories.id, id))
        .returning();
      return updatedCategory;
    },
    COPY_CATEGORY: async (id: string): Promise<{ id: string }> => {
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

      return { id: newCategory.id };
    },
    TOGGLE_IS_ACTIVE: async (ids: string[]): Promise<{ id: string }[]> => {
      const updatedCategories = await db
        .update(categories)
        .set({ isActive: not(categories.isActive) })
        .where(inArray(categories.id, ids))
        .returning({ id: categories.id });

      return updatedCategories.map((category) => ({ id: category.id }));
    },
    DELETE_CATEGORIES: async (ids: string[]): Promise<{ id: string }[]> => {
      const deletedCategories = await db
        .delete(categories)
        .where(inArray(categories.id, ids))
        .returning({ id: categories.id });
      return deletedCategories.map((category) => ({ id: category.id }));
    },
    TOGGLE_FEATURED: async (categoryId: string) => {
      const [updated] = await db
        .update(categories)
        .set({ isFeatured: not(categories.isFeatured) })
        .where(eq(categories.id, categoryId))
        .returning({ id: categories.id, isFeatured: categories.isFeatured });

      return updated;
    },
  },
};
