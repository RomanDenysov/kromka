import "server-only";

import { db } from "@/db";
import { productCategories } from "@/db/schema";

const FEATURED_PRODUCTS_LIMIT = 12;

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
          andFn(
            eq(category.isActive, true),
            eq(category.showInMenu, true),
            eq(category.isFeatured, false)
          ),
        with: {
          products: true,
        },
        orderBy: (category, { asc }) => asc(category.sortOrder),
      });

      return categories.filter((category) => category.products.length > 0);
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
    GET_FEATURED_CATEGORIES: async () => {
      const categories = await db.query.categories.findMany({
        where: (cat, { eq, and: andFn }) =>
          andFn(
            eq(cat.isFeatured, true),
            eq(cat.isActive, true),
            eq(cat.showInMenu, true)
          ),
        with: {
          products: {
            with: {
              product: {
                with: {
                  images: {
                    with: {
                      media: true,
                    },
                  },
                  categories: {
                    with: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: (cat, { asc }) => asc(cat.sortOrder),
      });

      return categories
        .map((category) => {
          const activeProducts = category.products
            .map((pc) => pc.product)
            .filter((p) => p.isActive && p.status === "active")
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .slice(0, FEATURED_PRODUCTS_LIMIT);

          for (const p of activeProducts) {
            p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
            p.categories = p.categories.sort(
              (a, b) => a.sortOrder - b.sortOrder
            );
          }

          return {
            ...category,
            products: activeProducts.map((p) => ({
              ...p,
              categories: p.categories.map((c) => c.category),
              images: p.images.map((img) => img.media.url),
            })),
          };
        })
        .filter((cat) => cat.products.length > 0);
    },
  },
};
