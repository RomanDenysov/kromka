import "server-only";

import { db } from "@/db";
import { productCategories } from "../schema";

export const QUERIES = {
  ADMIN: {
    GET_CATEGORIES: async () => await db.query.categories.findMany(),
    GET_CATEGORY_BY_ID: async (id: string) =>
      await db.query.categories.findFirst({
        where: (category, { eq: eqFn }) => eqFn(category.id, id),
        with: {
          parent: true,
          children: true,
          image: true,
          products: true,
        },
        orderBy: (category, { desc }) => desc(category.sortOrder),
      }),
    GET_CATEGORIES_BY_PRODUCT: async (productId: string) =>
      await db.query.categories.findMany({
        where: (category, { inArray, eq: eqFn, isNull, and }) =>
          and(
            isNull(category.deletedAt),
            inArray(
              category.id,
              db
                .select({ categoryId: productCategories.categoryId })
                .from(productCategories)
                .where(eqFn(productCategories.productId, productId))
            )
          ),
        with: {
          parent: true,
          children: true,
          image: true,
          products: true,
        },
        orderBy: (category, { desc }) => desc(category.sortOrder),
      }),
  },
};
