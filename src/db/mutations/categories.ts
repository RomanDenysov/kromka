import "server-only";

import { db } from "@/db";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import { categories } from "../schema";

type CategoryInsert = typeof categories.$inferInsert;

const DRAFT_DEFAULTS = Object.freeze({
  name: "Nová kategória",
  description: "Popis novej kategórie...",
  isActive: false,
  sortOrder: 0,
});

function createDraftCategoryData(
  overrides: Partial<CategoryInsert> = {}
): CategoryInsert {
  return {
    ...DRAFT_DEFAULTS,
    ...overrides,
    slug: `${getSlug(DRAFT_DEFAULTS.name)}-${createShortId()}`,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_CATEGORY: async (userId: string) => {
      const draftCategoryData: CategoryInsert = createDraftCategoryData();

      const [newDraftCategory] = await db
        .insert(categories)
        .values({ createdBy: userId, ...draftCategoryData })
        .returning();

      return newDraftCategory;
    },
  },
};
