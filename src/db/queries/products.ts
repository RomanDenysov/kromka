import "server-only";
import { db } from "@/db";
import { productCategories } from "../schema/categories";

export const QUERIES = {
  ADMIN: {
    GET_PRODUCTS: async () => {
      const products = await db.query.products.findMany({
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

      for (const product of products) {
        product.images = product.images.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
      }

      const result = products.map((product) => ({
        ...product,
        categories: product.categories.map((c) => c.category),
        images: product.images.map((img) => img.media.url),
        prices: product.prices.map((p) => ({
          minQty: p.minQty,
          priceCents: p.priceCents,
          priceTier: p.priceTier,
        })),
      }));

      return result;
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
      const products = await db.query.products.findMany({
        where: (product, { inArray, eq: eqFn }) =>
          inArray(
            product.id,
            db
              .select({ productId: productCategories.productId })
              .from(productCategories)
              .where(eqFn(productCategories.categoryId, categoryId))
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

      for (const product of products) {
        product.images = product.images.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.categories = product.categories.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.prices = product.prices.sort((a, b) => a.minQty - b.minQty);
      }

      return products.map((product) => ({
        ...product,
        categories: product.categories.map((c) => c.category),
        images: product.images.map((img) => img.media.url),
        prices: product.prices.map((p) => ({
          minQty: p.minQty,
          priceCents: p.priceCents,
          priceTier: p.priceTier,
        })),
      }));
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
      const products = await db.query.products.findMany({
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
          prices: true,
        },
        orderBy: (product, { desc }) => desc(product.createdAt),
      });

      for (const product of products) {
        product.images = product.images.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.categories = product.categories.sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        product.prices = product.prices.sort((a, b) => a.minQty - b.minQty);
      }

      const result = products.map((product) => ({
        ...product,
        categories: product.categories.map((c) => c.category),
        images: product.images.map((img) => img.media.url),
      }));

      return result;
    },
  },
};
