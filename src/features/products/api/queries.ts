/** biome-ignore-all lint/complexity/noVoid: we need to preload the products with void */
import "server-only";

import { desc, eq, gte, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getFeaturedCategories } from "@/features/categories/api/queries";
import { getEffectivePrices } from "@/lib/pricing";

// Helper to transform product image
function transformProduct<T extends { image: { url: string } | null }>(
  product: T
) {
  return {
    ...product,
    imageUrl: product.image?.url ?? null,
  };
}

// PUBLIC (cached, for storefront)
// One function to get all products just reused for all queries for better performance
export const getProducts = cache(async () => {
  "use cache";
  cacheLife("max");
  cacheTag("products");

  const data = await db.query.products.findMany({
    where: (p, { eq: eqOp, and, notInArray }) =>
      and(eqOp(p.isActive, true), notInArray(p.status, ["archived", "draft"])),
    with: {
      image: true,
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
  cacheLife("max");
  cacheTag("products", `product-${slug}`);

  const product = await db.query.products.findFirst({
    where: (p, { eq: eqOp }) => eqOp(p.slug, slug),
    with: {
      image: true,
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
  cacheLife("max");
  cacheTag("products", `category-${slug}`);

  const allProducts = await getProducts();
  const filtered = allProducts.filter((p) => p.category?.slug === slug);

  return filtered.length > 0 ? filtered : null;
});

export const preloadProductsByCategory = (slug: string) =>
  void getProductsByCategory(slug);

/**
 * Get products filtered by catalog type (B2B or B2C).
 * Optionally overlays tier prices for B2B catalog.
 */
export async function getProductsByCatalog({
  catalog,
  priceTierId,
}: {
  catalog: "b2b" | "b2c";
  priceTierId?: string | null;
}) {
  const allProducts = await getProducts();

  // Filter by catalog visibility
  const filteredProducts = allProducts.filter((p) => {
    if (catalog === "b2b") {
      return p.showInB2b === true;
    }
    return p.showInB2c === true;
  });

  // If B2B and tier provided, overlay tier prices
  if (catalog === "b2b" && priceTierId) {
    const productPrices = filteredProducts.map((p) => ({
      productId: p.id,
      basePriceCents: p.priceCents,
    }));

    const effectivePrices = await getEffectivePrices({
      productPrices,
      priceTierId,
    });

    return filteredProducts.map((product) => ({
      ...product,
      priceCents: effectivePrices.get(product.id) ?? product.priceCents,
    }));
  }

  return filteredProducts;
}

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
      image: true,
    },
    orderBy: (product, { desc }) => desc(product.createdAt),
    limit: 500,
  });

  return fetchedProducts.map((p) => ({
    ...p,
    imageUrl: p.image?.url ?? null,
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
      image: true,
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
    imageUrl: product.image?.url ?? null,
    category: product.category,
    prices: product.prices.map((p) => ({
      priceCents: p.priceCents,
      priceTier: p.priceTier,
    })),
  };
}

// HOMEPAGE

async function getTopSellerIds(limit: number, daysWindow: number) {
  const since = new Date();
  since.setDate(since.getDate() - daysWindow);

  const rows = await db
    .select({
      productId: orderItems.productId,
      totalQty: sum(orderItems.quantity).mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(gte(orders.createdAt, since))
    .groupBy(orderItems.productId)
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(limit);

  return rows.map((r) => r.productId);
}

export async function getHomepageProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("homepage-products");

  const [topSellerIds, allProducts, featuredCategories] = await Promise.all([
    getTopSellerIds(8, 30),
    getProducts(),
    getFeaturedCategories(),
  ]);

  // Top sellers: map IDs to full Product objects, preserving sales order
  const productMap = new Map(allProducts.map((p) => [p.id, p]));
  const topSellers = topSellerIds
    .map((id) => productMap.get(id))
    .filter((p): p is Product => p !== undefined);

  // Seasonal: products from first featured category
  const seasonal = featuredCategories[0]?.products.slice(0, 6) ?? [];

  const usedIds = new Set([...topSellers, ...seasonal].map((p) => p.id));
  const newArrivals = allProducts
    .filter((p) => !usedIds.has(p.id))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  return { topSellers, seasonal, newArrivals };
}

// Types
export type Product = Awaited<ReturnType<typeof getProducts>>[number];
export type AdminProduct = NonNullable<
  Awaited<ReturnType<typeof getAdminProductById>>
>;
export type AdminProductList = Awaited<ReturnType<typeof getAdminProducts>>;
