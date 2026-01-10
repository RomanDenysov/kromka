import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { getProducts } from "@/features/products/queries";

// PUBLIC (cached)
export const getCategories = cache(async () => {
  "use cache";
  cacheLife("days");
  cacheTag("categories");

  const allProducts = await getProducts();

  const data = await db.query.categories.findMany({
    where: (cat, { eq, and }) =>
      and(
        eq(cat.isActive, true),
        eq(cat.showInMenu, true),
        eq(cat.isFeatured, false)
      ),
  });

  const categoryIdsWithProducts = new Set(
    allProducts.map((p) => p.categoryId).filter(Boolean)
  );

  return data.filter((cat) => categoryIdsWithProducts.has(cat.id));
});

export const getFeaturedCategories = cache(async () => {
  "use cache";
  cacheLife("days");
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
    .filter((cat) => cat.products.length > 0);
});

// ADMIN (no cache)
export function getAdminCategories() {
  return db.query.categories.findMany({
    with: {
      products: true,
      image: true,
    },
    orderBy: (cat, { asc }) => asc(cat.sortOrder),
  });
}

export function getAdminCategoryById(id: string) {
  return db.query.categories.findFirst({
    where: (cat, { eq }) => eq(cat.id, id),
    with: {
      products: true,
      image: true,
    },
  });
}

export type Category = Awaited<ReturnType<typeof getCategories>>[number];
export type FeaturedCategory = Awaited<
  ReturnType<typeof getFeaturedCategories>
>[number];

export type AdminCategory = Awaited<
  ReturnType<typeof getAdminCategories>
>[number];
