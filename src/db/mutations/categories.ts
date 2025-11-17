import "server-only";

import { eq, not } from "drizzle-orm";
import { db } from "@/db";
import type { UpdateCategorySchema } from "@/validation/categories";
import { categories } from "../schema";
import { draftSlug } from "../utils";

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
    TOGGLE_IS_ACTIVE: async (id: string): Promise<{ id: string }> => {
      const [updatedCategory] = await db
        .update(categories)
        .set({ isActive: not(categories.isActive) })
        .where(eq(categories.id, id))
        .returning({ id: categories.id });

      return { id: updatedCategory.id };
    },
  },
};
