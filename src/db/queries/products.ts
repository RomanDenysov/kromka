import "server-only";

import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { categories, productCategories } from "../schema";

export const QUERIES = {
  ADMIN: {
    GET_PRODUCTS: async () =>
      await db.query.products.findMany({
        where: (product, { isNull: isNullFn }) => isNullFn(product.deletedAt),
        with: {
          categories: {
            where: (productCategory, { inArray }) =>
              inArray(
                productCategory.categoryId,
                db
                  .select({ id: categories.id })
                  .from(categories)
                  .where(isNull(categories.deletedAt))
              ),
            with: {
              category: true,
            },
          },
          channels: true,
          prices: true,
          images: {
            where: (productImage, { eq: eqFn }) =>
              eqFn(productImage.isPrimary, true),
            with: {
              media: {
                with: {},
              },
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
    GET_PRODUCT_BY_ID: async (id: string) =>
      await db.query.products.findFirst({
        where: (product, { and: andFn, isNull: isNullFn, eq: eqFn }) =>
          andFn(isNullFn(product.deletedAt), eqFn(product.id, id)),
        with: {
          categories: {
            where: (productCategory, { inArray }) =>
              inArray(
                productCategory.categoryId,
                db
                  .select({ id: categories.id })
                  .from(categories)
                  .where(isNull(categories.deletedAt))
              ),
            with: {
              category: true,
            },
          },
          channels: true,
          prices: true,
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          images: {
            where: (productImage, { eq: eqFn }) =>
              eqFn(productImage.isPrimary, true),
            with: {
              media: {
                with: {},
              },
            },
          },
        },
      }),
    GET_PRODUCTS_BY_CATEGORY: async (categoryId: string) =>
      await db.query.products.findMany({
        where: (
          product,
          { isNull: isNullFn, inArray: inArrayFn, and: andFn }
        ) =>
          andFn(
            isNullFn(product.deletedAt),
            inArrayFn(
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
                  .where(isNull(categories.deletedAt))
              ),
            with: {
              category: true,
            },
          },
          prices: true,
          images: true,
        },
      }),
    GET_PRODUCT_IMAGES: async (productId: string) =>
      await db.query.products.findFirst({
        where: (product, { eq: eqFn }) => eqFn(product.id, productId),
        with: {
          images: {
            orderBy: (productImages, { asc }) => [asc(productImages.sortOrder)],
            with: {
              media: true,
            },
          },
        },
      }),
  },
};
