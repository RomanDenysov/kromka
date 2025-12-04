import "server-only";

import { and, count, eq, inArray, not } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";

export const QUERIES = {
  ADMIN: {
    GET_PRODUCTS: async () => {
      const fetchedProducts = await db.query.products.findMany({
        with: {
          category: true,
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
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        images: p.images.map((img) => img.media.url),
        category: p.category,
        prices: p.prices.map((pt) => ({
          priceCents: pt.priceCents,
          priceTier: pt.priceTier,
        })),
      }));

      return processedProducts;
    },
    GET_PRODUCT_BY_ID: async (id: string) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, id),
        with: {
          category: true,
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

        return {
          ...product,
          images: product.images.map((img) => img.media.url),
          category: product.category,
          prices: product.prices.map((p) => ({
            priceCents: p.priceCents,
            priceTier: p.priceTier,
          })),
        };
      }

      return null;
    },
    GET_PRODUCTS_BY_CATEGORY: async (categoryId: string) => {
      const fetchedProducts = await db.query.products.findMany({
        where: eq(products.categoryId, categoryId),
        with: {
          category: true,
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
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        images: p.images.map((img) => img.media.url),
        category: p.category,
        prices: p.prices.map((pt) => ({
          priceCents: pt.priceCents,
          priceTier: pt.priceTier,
        })),
      }));

      return processedProducts;
    },
    GET_PRODUCT_IMAGES: async (productId: string) =>
      await db.query.productImages.findMany({
        where: eq(productImages.productId, productId),
        with: {
          media: true,
        },
        orderBy: (productImage, { asc }) => asc(productImage.sortOrder),
      }),
  },
  PUBLIC: {
    GET_PRODUCTS: async () => {
      const fetchedProducts = await db.query.products.findMany({
        where: and(eq(products.isActive, true), eq(products.status, "active")),
        with: {
          images: {
            with: {
              media: true,
            },
          },
          category: true,
        },
        orderBy: (product, { desc }) => desc(product.createdAt),
      });

      for (const p of fetchedProducts) {
        p.images = p.images.sort((a, b) => a.sortOrder - b.sortOrder);
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        images: p.images.map((img) => img.media.url),
        category: p.category,
      }));

      return processedProducts;
    },
    GET_PRODUCT_BY_SLUG: async (slug: string) => {
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.slug, slug),
          eq(products.isActive, true),
          inArray(products.status, ["active", "sold"])
        ),
        with: {
          images: {
            with: {
              media: true,
            },
          },
          category: true,
        },
      });

      if (product) {
        product.images = product.images.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );

        return {
          ...product,
          images: product.images.map((img) => img.media.url),
          category: product.category,
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
        where: and(
          eq(products.isActive, true),
          not(eq(products.status, "archived")),
          not(eq(products.status, "draft")),
          categoryId
            ? inArray(
                products.id,
                db
                  .select({ productId: products.id })
                  .from(products)
                  .where(eq(products.categoryId, categoryId))
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
          category: true,
        },
        orderBy: (product, { asc, desc }) => [
          asc(product.sortOrder),
          desc(product.createdAt),
          asc(product.id),
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
                .select({ productId: products.id })
                .from(products)
                .where(eq(products.categoryId, categoryId))
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
      }

      const processedProducts = fetchedProducts.map((p) => ({
        ...p,
        images: p.images.map((img) => img.media.url),
        category: p.category,
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
