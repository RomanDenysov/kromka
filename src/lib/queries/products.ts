import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${slug}`);

  const product = await db.query.products.findFirst({
    where: (p, { eq, and, notInArray }) =>
      and(
        and(
          eq(p.slug, slug),
          eq(p.isActive, true),
          notInArray(p.status, ["archived", "draft"])
        )
        // notInArray(p.status, ["archived", "draft"])
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
    product.images = product.images.sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      ...product,
      images: product.images.map((img) => img.media.url),
    };
  }

  return null;
}

export type Product = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

async function getCategoryIdBySlug(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag("categories", `category-${slug}`);

  const cat = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.slug, slug),
    columns: { id: true },
  });
  return cat?.id;
}

type GetProductsInfiniteInput = {
  limit?: number;
  cursor?: number;
  categorySlug?: string;
};

export const getProductsInfinite = async (input: GetProductsInfiniteInput) => {
  const { limit = 12, cursor = 0, categorySlug } = input;

  const categoryId = categorySlug
    ? await getCategoryIdBySlug(categorySlug)
    : undefined;

  // If slug is provided but category is not found, return empty array
  if (categorySlug && !categoryId) {
    return { data: [], hasMore: false, nextCursor: undefined };
  }

  const fetchedProducts = await db.query.products.findMany({
    where: (p, { eq, and, notInArray }) =>
      and(
        eq(p.isActive, true),
        notInArray(p.status, ["archived", "draft"]),
        categoryId ? eq(p.categoryId, categoryId) : undefined
      ),
    limit: limit + 1,
    offset: cursor,
    with: {
      images: {
        with: { media: true },
        orderBy: (image, { asc }) => [asc(image.sortOrder)],
      },
      category: true,
    },
    orderBy: (p, { asc, desc }) => [
      asc(p.sortOrder),
      desc(p.createdAt),
      asc(p.id),
    ],
  });

  const hasMore = fetchedProducts.length > limit;
  const data = hasMore ? fetchedProducts.slice(0, limit) : fetchedProducts;

  return {
    data: data.map((p) => ({
      ...p,
      images: p.images.map((img) => img.media.url),
    })),
    hasMore,
    nextCursor: hasMore ? cursor + limit : undefined,
  };
};

export type ProductsInfinite = Awaited<ReturnType<typeof getProductsInfinite>>;

export async function getAllProducts() {
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
      category: true,
    },
    orderBy: (p, { asc, desc }) => [asc(p.sortOrder), desc(p.createdAt)],
  });

  return data.map((p) => ({
    ...p,
    images: p.images.map((img) => img.media.url),
  }));
}

export async function getAllCategories() {
  "use cache";
  cacheLife("days");
  cacheTag("categories");

  const data = await db.query.categories.findMany({
    where: (cat, { eq, and }) =>
      and(
        eq(cat.isActive, true),
        eq(cat.showInMenu, true),
        eq(cat.isFeatured, false)
      ),
  });

  return data;
}

export async function getFeaturedCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("featured", "products");

  const categories = await db.query.categories.findMany({
    where: (cat, { eq, and }) =>
      and(
        eq(cat.isFeatured, true),
        eq(cat.isActive, true),
        eq(cat.showInMenu, true)
      ),
    with: {
      products: {
        where: (product, { eq, and, notInArray }) =>
          and(
            eq(product.isActive, true),
            notInArray(product.status, ["archived", "draft"])
          ),
        with: {
          images: {
            with: { media: true },
            orderBy: (img, { asc }) => asc(img.sortOrder),
          },
        },
        orderBy: (p, { asc }) => asc(p.sortOrder),
      },
    },
    orderBy: (cat, { asc }) => asc(cat.sortOrder),
  });

  // Трансформація тут — компонент отримує готові дані
  return categories.map((cat) => ({
    ...cat,
    products: cat.products.map((product) => ({
      ...product,
      images: product.images.map((img) => img.media.url),
      category: { name: cat.name, slug: cat.slug },
    })),
  }));
}

export type FeaturedCategory = Awaited<
  ReturnType<typeof getFeaturedCategories>
>[number];

export type FeaturedProduct = FeaturedCategory["products"][number];
export async function getProductsByCategory(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `category-${slug}`);

  const category = await db.query.categories.findFirst({
    where: (cat, { eq }) => eq(cat.slug, slug),
  });

  if (!category) {
    return null;
  }

  const data = await db.query.products.findMany({
    where: (p, { eq, and, notInArray }) =>
      and(
        eq(p.isActive, true),
        eq(p.categoryId, category.id),
        notInArray(p.status, ["archived", "draft"])
      ),
    with: {
      images: {
        with: { media: true },
        orderBy: (img, { asc }) => [asc(img.sortOrder)],
      },
      category: true,
    },
    orderBy: (p, { asc, desc }) => [asc(p.sortOrder), desc(p.createdAt)],
  });

  return data.map((p) => ({
    ...p,
    images: p.images.map((img) => img.media.url),
  }));
}
