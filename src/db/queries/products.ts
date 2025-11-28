import "server-only";
import { and, count, eq, inArray, not } from "drizzle-orm";
import { db } from "@/db";
import { productCategories, products } from "@/db/schema";

export const QUERIES = {
  ADMIN: {
    GET_PRODUCTS: async () => {
      const fetchedProducts = await db.query.products.findMany({
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          prices: {
            with: {
              priceTier: true,
            },
          },
          images: {
            with: {
              media: true,
            },
          },
        },
        orderBy: (product, { desc }) => desc(product.createdAt),
      });

      for (const p of fetchedProducts) {
        p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
        p.categories = p.categories.sort((a, b) => a.sortOrder - b.sortOrder);
        p.prices = p.prices.sort((a, b) => a.minQty - b.minQty);
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        categories: p.categories.map((c) => c.category),
        images: p.images.map((img) => img.media.url),
        prices: p.prices.map((pt) => ({
          minQty: pt.minQty,
          priceCents: pt.priceCents,
          priceTier: pt.priceTier,
        })),
      }));

      return processedProducts;
    },
    GET_PRODUCT_BY_ID: async (id: string) => {
      const product = await db.query.products.findFirst({
        where: (p, { eq: eqFn }) => eqFn(p.id, id),
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          images: {
            with: {
              media: true,
            },
          },
          prices: {
            with: {
              priceTier: true,
            },
          },
        },
      });

      if (product) {
        product.images = product.images.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.categories = product.categories.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.prices = product.prices.sort((a, b) => a.minQty - b.minQty);

        return {
          ...product,
          categories: product.categories.map((c) => c.category),
          images: product.images.map((img) => img.media.url),
          prices: product.prices.map((p) => ({
            minQty: p.minQty,
            priceCents: p.priceCents,
            priceTier: p.priceTier,
          })),
        };
      }

      return null;
    },
    GET_PRODUCTS_BY_CATEGORY: async (categoryId: string) => {
      const fetchedProducts = await db.query.products.findMany({
        where: (product, { inArray: inArrayFn }) =>
          inArray(
            product.id,
            db
              .select({ productId: productCategories.productId })
              .from(productCategories)
              .where(inArrayFn(productCategories.categoryId, [categoryId]))
          ),
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          images: {
            with: {
              media: true,
            },
          },
          prices: {
            with: {
              priceTier: true,
            },
          },
        },
      });

      for (const p of fetchedProducts) {
        p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
        p.categories = p.categories.sort((a, b) => a.sortOrder - b.sortOrder);
        p.prices = p.prices.sort((a, b) => a.minQty - b.minQty);
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        categories: p.categories.map((c) => c.category),
        images: p.images.map((img) => img.media.url),
        prices: p.prices.map((pt) => ({
          minQty: pt.minQty,
          priceCents: pt.priceCents,
          priceTier: pt.priceTier,
        })),
      }));

      return processedProducts;
    },
    GET_PRODUCT_IMAGES: async (productId: string) =>
      await db.query.productImages.findMany({
        where: (productImage, { eq: eqFn }) =>
          eqFn(productImage.productId, productId),
        with: {
          media: true,
        },
        orderBy: (productImage, { asc }) => asc(productImage.sortOrder),
      }),
  },
  PUBLIC: {
    GET_PRODUCTS: async () => {
      const fetchedProducts = await db.query.products.findMany({
        where: (product, { eq: eqFn, and: andFn }) =>
          andFn(eqFn(product.isActive, true), eqFn(product.status, "active")),
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
        orderBy: (product, { desc }) => desc(product.createdAt),
      });

      for (const p of fetchedProducts) {
        p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
        p.categories = p.categories.sort((a, b) => a.sortOrder - b.sortOrder);
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        categories: p.categories.map((c) => c.category),
        images: p.images.map((img) => img.media.url),
      }));

      return processedProducts;
    },
    GET_PRODUCT_BY_SLUG: async (slug: string) => {
      const product = await db.query.products.findFirst({
        where: (p, { eq: eqFn, and: andFn, inArray: inArrayFn }) =>
          andFn(
            eqFn(p.slug, slug),
            eqFn(p.isActive, true),
            inArrayFn(p.status, ["active", "sold"])
          ),
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
      });

      if (product) {
        product.images = product.images.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.categories = product.categories.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );

        return {
          ...product,
          categories: product.categories.map((c) => c.category),
          images: product.images.map((img) => img.media.url),
        };
      }

      return null;
    },
    GET_PRODUCTS_INFINITE: async (input: {
      limit?: number;
      cursor?: number;
      categoryId?: string;
    }) => {
      const { limit = 12, cursor = 0, categoryId } = input;
      const fetchedProducts = await db.query.products.findMany({
        where: (
          product,
          { eq: eqFn, not: notFn, and: andFn, inArray: inArrayFn }
        ) =>
          andFn(
            eqFn(product.isActive, true),
            notFn(eqFn(product.status, "archived")),
            notFn(eqFn(product.status, "draft")),
            categoryId
              ? inArrayFn(
                  product.id,
                  db
                    .select({ productId: productCategories.productId })
                    .from(productCategories)
                    .where(eqFn(productCategories.categoryId, categoryId))
                )
              : undefined
          ),
        limit: limit + 1,
        offset: cursor,
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
        orderBy: (product, { asc: ascFn, desc: descFn }) => [
          ascFn(product.sortOrder),
          descFn(product.createdAt),
          ascFn(product.id),
        ],
      });

      const whereConditions = and(
        eq(products.isActive, true),
        not(eq(products.status, "archived")),
        not(eq(products.status, "draft")),
        categoryId
          ? inArray(
              products.id,
              db
                .select({ productId: productCategories.productId })
                .from(productCategories)
                .where(eq(productCategories.categoryId, categoryId))
            )
          : undefined
      );

      const [total] = await db
        .select({ count: count() })
        .from(products)
        .where(whereConditions);

      let hasMore = false;
      let nextCursor: number | undefined;

      if (fetchedProducts.length > limit) {
        hasMore = true;
        fetchedProducts.pop();
      }

      if (hasMore) {
        nextCursor = cursor + limit;
      }

      for (const p of fetchedProducts) {
        p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
        p.categories = p.categories.sort((a, b) => a.sortOrder - b.sortOrder);
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        categories: p.categories.map((c) => c.category),
        images: p.images.map((img) => img.media.url),
      }));

      const result = {
        data: processedProducts,
        total: total?.count ?? 0,
        hasMore,
        nextCursor,
      };

      return result;
    },
  },
};
