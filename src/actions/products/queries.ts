import { isNull as drizzleIsNull, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { categories, productCategories } from "@/db/schema";

export const getProducts = cache(async () => {
  const products = await db.query.products.findMany({
    where: (product, { isNull }) => isNull(product.deletedAt),
    with: {
      categories: {
        where: (productCategory, { inArray }) =>
          inArray(
            productCategory.categoryId,
            db
              .select({ id: categories.id })
              .from(categories)
              .where(drizzleIsNull(categories.deletedAt))
          ),
        with: {
          category: true,
        },
      },
      prices: true,
      images: true,
    },
  });
  return products;
});

export const getProductsByCategory = cache(async (categoryId: string) => {
  const products = await db.query.products.findMany({
    where: (product, { isNull, inArray, and }) =>
      and(
        isNull(product.deletedAt),
        inArray(
          product.id,
          db
            .select({ productId: productCategories.productId })
            .from(productCategories)
            .where(eq(productCategories.categoryId, categoryId))
        )
      ),
    with: {
      categories: {
        where: (productCategory, { inArray }) =>
          inArray(
            productCategory.categoryId,
            db
              .select({ id: categories.id })
              .from(categories)
              .where(drizzleIsNull(categories.deletedAt))
          ),
        with: {
          category: true,
        },
      },
      prices: true,
      images: true,
    },
  });
  return products;
});

export const getProduct = cache(
  async (id: string) =>
    await db.query.products.findFirst({
      where: (product, { and, isNull, eq: eqFn }) =>
        and(isNull(product.deletedAt), eqFn(product.id, id)),
      with: {
        categories: {
          where: (productCategory, { inArray }) =>
            inArray(
              productCategory.categoryId,
              db
                .select({ id: categories.id })
                .from(categories)
                .where(drizzleIsNull(categories.deletedAt))
            ),
          with: {
            category: true,
          },
        },
      },
    })
);
