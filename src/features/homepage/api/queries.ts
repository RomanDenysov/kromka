import "server-only";

import { desc, eq, gte, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { HOMEPAGE_PECIVO_CATEGORY_SLUG } from "@/config/homepage";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getFeaturedCategories } from "@/features/categories/api/queries";
import { getProducts, type Product } from "@/features/products/api/queries";

/**
 * Homepage composition layer. Aggregates across products + categories, so it
 * lives above both leaves (importing them, never the reverse) to keep the
 * feature dependency graph acyclic.
 */

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

  const TOP_SELLERS_ON_HOMEPAGE = 8;
  /** Extra IDs to scan so we can still fill the row after dropping the dedicated pečivo category */
  const TOP_SELLER_ID_POOL = TOP_SELLERS_ON_HOMEPAGE * 6;

  const [topSellerIds, allProducts, featuredCategories] = await Promise.all([
    getTopSellerIds(TOP_SELLER_ID_POOL, 30),
    getProducts(),
    getFeaturedCategories(),
  ]);

  // Top sellers: map IDs to full Product objects, preserving sales order;
  // omit "Naše pečivo" — it has its own homepage section
  const productMap = new Map(allProducts.map((p) => [p.id, p]));
  const topSellers: Product[] = [];
  for (const id of topSellerIds) {
    const product = productMap.get(id);
    if (!product) {
      continue;
    }
    if (product.category?.slug === HOMEPAGE_PECIVO_CATEGORY_SLUG) {
      continue;
    }
    topSellers.push(product);
    if (topSellers.length >= TOP_SELLERS_ON_HOMEPAGE) {
      break;
    }
  }

  // Seasonal: products from first featured category
  const seasonal = featuredCategories[0]?.products.slice(0, 6) ?? [];

  const usedIds = new Set([...topSellers, ...seasonal].map((p) => p.id));
  const newArrivals = allProducts
    .filter((p) => !usedIds.has(p.id))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  return { topSellers, seasonal, newArrivals };
}
