import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";

export const getProducts = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const data = await db.query.products.findMany({
    where: (p, { eq, and, notInArray }) =>
      and(eq(p.isActive, true), notInArray(p.status, ["archived", "draft"])),
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

  return data.map((p) => ({
    ...p,
    images: p.images.map((img) => img.media.url),
  }));
});

// biome-ignore lint/complexity/noVoid: we need to preload the products
export const preloadProducts = () => void getProducts();

export const getProductBySlug = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${slug}`);

  const allProducts = await getProducts();
  return allProducts.find((p) => p.slug === slug) ?? null;
});

export const getCategories = cache(async () => {
  "use cache";
  cacheLife("days");
  cacheTag("categories");

  // Reuse products to count the number of products in each category
  const allProducts = await getProducts();

  const data = await db.query.categories.findMany({
    where: (cat, { eq, and }) =>
      and(
        eq(cat.isActive, true),
        eq(cat.showInMenu, true),
        eq(cat.isFeatured, false)
      ),
  });

  // Filter categories that have active products
  const categoryIdsWithProducts = new Set(
    allProducts.map((p) => p.categoryId).filter(Boolean)
  );

  return data.filter((cat) => categoryIdsWithProducts.has(cat.id));
});

export const getFeaturedCategories = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("featured", "products");

  const allProducts = await getProducts();

  const categories = await db.query.categories.findMany({
    where: (cat, { eq, and }) =>
      and(
        eq(cat.isFeatured, true),
        eq(cat.isActive, true),
        eq(cat.showInMenu, true)
      ),
    orderBy: (cat, { asc }) => asc(cat.sortOrder),
  });

  return categories
    .map((cat) => ({
      ...cat,
      products: allProducts
        .filter((p) => p.categoryId === cat.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((cat) => cat.products.length > 0); // only with products
});

export const getProductsByCategory = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `category-${slug}`);

  // Reuse existing cached function
  const allProducts = await getProducts();
  const filtered = allProducts.filter((p) => p.category?.slug === slug);

  // Will work fine if we have less than ~100 products in the category

  return filtered.length > 0 ? filtered : null;
});

export const preloadProductsByCategory = (slug: string) =>
  // biome-ignore lint/complexity/noVoid: we need to preload the products by category
  void getProductsByCategory(slug);

export type Product = Awaited<ReturnType<typeof getProducts>>[number];
export type Category = Awaited<ReturnType<typeof getCategories>>[number];
export type FeaturedCategory = Awaited<
  ReturnType<typeof getFeaturedCategories>
>[number];
