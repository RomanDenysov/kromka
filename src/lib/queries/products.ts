/** biome-ignore-all lint/complexity/noVoid: we need to preload the products with void */
import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { products } from "@/db/schema";

// Helper to transform product images
function transformProduct<T extends { images: { media: { url: string } }[] }>(
  product: T
) {
  return {
    ...product,
    images: product.images.map((img) => img.media.url),
  };
}

// PUBLIC (cached, for storefront)
// One function to get all products just reused for all queries for better performance
export const getProducts = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const data = await db.query.products.findMany({
    where: (p, { eq: eqOp, and, notInArray }) =>
      and(eqOp(p.isActive, true), notInArray(p.status, ["archived", "draft"])),
    with: {
      images: {
        with: { media: true },
        orderBy: (image, { asc }) => [asc(image.sortOrder)],
      },
      category: {
        columns: { id: true, name: true, slug: true, pickupDates: true },
      },
    },
    orderBy: (p, { asc, desc }) => [asc(p.sortOrder), desc(p.createdAt)],
  });

  return data.map(transformProduct);
});

export const preloadProducts = () => void getProducts();

export const getProductBySlug = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${slug}`);

  const product = await db.query.products.findFirst({
    where: (p, { eq: eqOp }) => eqOp(p.slug, slug),
    with: {
      images: {
        with: { media: true },
        orderBy: (image, { asc }) => [asc(image.sortOrder)],
      },
      category: true,
      prices: {
        with: { priceTier: true },
      },
    },
  });

  return product ? transformProduct(product) : null;
});

export const getProductsByCategory = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `category-${slug}`);

  const allProducts = await getProducts();
  const filtered = allProducts.filter((p) => p.category?.slug === slug);

  return filtered.length > 0 ? filtered : null;
});

export const preloadProductsByCategory = (slug: string) =>
  void getProductsByCategory(slug);

// ADMIN (no cache, always fresh)
export async function getAdminProducts() {
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

  return fetchedProducts.map((p) => ({
    ...p,
    images: p.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.media.url),
    prices: p.prices.map((pt) => ({
      priceCents: pt.priceCents,
      priceTier: pt.priceTier,
    })),
  }));
}

export async function getAdminProductById(id: string) {
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

  if (!product) {
    return null;
  }

  return {
    ...product,
    images: product.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.media.url),
    category: product.category,
    prices: product.prices.map((p) => ({
      priceCents: p.priceCents,
      priceTier: p.priceTier,
    })),
  };
}

// Types
export type Product = Awaited<ReturnType<typeof getProducts>>[number];
export type AdminProduct = NonNullable<
  Awaited<ReturnType<typeof getAdminProductById>>
>;
export type AdminProductList = Awaited<ReturnType<typeof getAdminProducts>>;
