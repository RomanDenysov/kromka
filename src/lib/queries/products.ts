"use server";

import { and, count, eq, inArray, not } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { products } from "@/db/schema";

export const getProductBySlug = cache(async (slug: string) => {
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
      // TODO: update later when we will remove multiple categories
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
});

export type Product = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export const getProductsInfinite = cache(
  async (input: { limit?: number; cursor?: number; categoryId?: string }) => {
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
  }
);

export type ProductsInfinite = Awaited<ReturnType<typeof getProductsInfinite>>;
