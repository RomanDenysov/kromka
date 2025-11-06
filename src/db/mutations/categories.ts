import "server-only";

import { db } from "@/db";
import { getSlug } from "@/lib/get-slug";
import { createShortId } from "@/lib/ids";
import { categories } from "../schema";
import type { CreateCategory } from "../schemas";

const DRAFT_DEFAULTS = Object.freeze({
  name: "New Category",
  description: "New Category Description",
  isActive: false,
  sortOrder: 0,
});

function createDraftCategoryData(
  overrides: Partial<CreateCategory> = {}
): CreateCategory {
  return {
    ...DRAFT_DEFAULTS,
    ...overrides,
    slug: `${getSlug("new-category")}-${createShortId()}`,
  };
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_CATEGORY: async () => {
      const draftCategoryData: CreateCategory = createDraftCategoryData();

      const [newDraftCategory] = await db
        .insert(categories)
        .values(draftCategoryData)
        .returning();

      return newDraftCategory;
    },
  },
};
