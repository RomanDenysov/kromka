import "server-only";

import { db } from "@/db";
import { productCategories } from "../schema";

export const QUERIES = {
  ADMIN: {
    GET_PRODUCTS: async () => await db.query.products.findMany(),
    GET_PRODUCT_BY_ID: async (id: string) =>
      await db.query.products.findFirst({
        where: (product, { eq: eqFn }) => eqFn(product.id, id),
      }),
    GET_PRODUCTS_BY_CATEGORY: async (categoryId: string) =>
      await db.query.products.findMany({
        where: (product, { inArray, eq: eqFn, isNull, and }) =>
          and(
            isNull(product.deletedAt),
            inArray(
              product.id,
              db
                .select({ productId: productCategories.productId })
                .from(productCategories)
                .where(eqFn(productCategories.categoryId, categoryId))
            )
          ),
      }),
  },
};
