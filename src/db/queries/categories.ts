import "server-only";
import { db } from "@/db";
import { productCategories } from "../schema";

export const QUERIES = {
  ADMIN: {
    GET_CATEGORIES: async () => {
      const categories = await db.query.categories.findMany({
        with: {
          products: {
            with: {
              product: true,
            },
          },
        },
        orderBy: (category, { asc, desc }) => [
          asc(category.sortOrder),
          desc(category.createdAt),
        ],
      });

      return categories.map((category) => ({
        ...category,
        products: category.products.map((product) => product.product),
        productsCount: category.products.length,
      }));
    },
    GET_CATEGORY_BY_ID: async (id: string) =>
      await db.query.categories.findFirst({
        where: (category, { eq: eqFn }) => eqFn(category.id, id),
        with: {
          products: {
            with: {
              product: true,
            },
          },
        },
      }),
    GET_CATEGORIES_BY_PRODUCT: async (productId: string) =>
      await db.query.categories.findMany({
        where: (category, { inArray, eq, and: andFn }) =>
          inArray(
            category.id,
            db
              .select({ categoryId: productCategories.categoryId })
              .from(productCategories)
              .where(
                andFn(
                  eq(productCategories.productId, productId),
                  eq(productCategories.categoryId, category.id)
                )
              )
          ),
        with: {
          products: {
            with: {
              product: true,
            },
          },
        },
        orderBy: (category, { desc }) => desc(category.sortOrder),
      }),
  },
  PUBLIC: {
    GET_CATEGORIES: async () => {
      const categories = await db.query.categories.findMany({
        where: (category, { eq, and: andFn }) =>
          andFn(eq(category.isActive, true), eq(category.showInMenu, true)),
        orderBy: (category, { asc }) => asc(category.sortOrder),
      });

      return categories;
    },
    GET_CATEGORY_BY_SLUG: async (slug: string) =>
      await db.query.categories.findFirst({
        where: (category, { eq, and: andFn }) =>
          andFn(
            eq(category.slug, slug),
            eq(category.isActive, true),
            eq(category.showInMenu, true)
          ),
      }),
  },
};
