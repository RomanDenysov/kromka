import "server-only";
import { db } from "@/db";

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
          prices: true,
          images: {
            with: {
              media: true,
            },
          },
          channels: true,
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
        channels: product.channels.map((ch) => ch.channel),
      }));

      return result;
    },
    GET_PRODUCT_BY_ID: async (id: string) =>
      await db.query.products.findFirst({
        where: (product, { eq: eqFn }) => eqFn(product.id, id),
      }),
    GET_PRODUCTS_BY_CATEGORY: async (categoryId: string) =>
      await db.query.products.findMany({
        where: (product, { eq: eqFn }) => eqFn(product.id, categoryId),
      }),
    GET_PRODUCT_IMAGES: async (productId: string) =>
      await db.query.products.findFirst({
        where: (product, { eq: eqFn }) => eqFn(product.id, productId),
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
          channels: {
            where: (channel, { eq: eqFn, and: andFn }) =>
              andFn(eqFn(channel.isListed, true), eqFn(channel.channel, "B2C")),
          },
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
        product.prices = product.prices.sort((a, b) => a.priority - b.priority);
      }

      const result = products.map((product) => ({
        ...product,
        categories: product.categories.map((c) => c.category),
        images: product.images.map((img) => img.media.url),
        channels: product.channels,
      }));

      return result;
    },
  },
};
