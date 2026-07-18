import "server-only";

import { and, desc, eq, gte, inArray, sum } from "drizzle-orm";
import type { Route } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { getCategoriesLink } from "@/app/(public)/(pages)/e-shop/eshop-params";
import { featureFlags } from "@/config/features";
import { db } from "@/db";
import {
  type HomepageBlockType,
  type HomepageCarouselSourceType,
  homepageSections,
  orderItems,
  orders,
} from "@/db/schema";
import {
  HOMEPAGE_BEST_SELLER_POOL_MULTIPLIER,
  HOMEPAGE_BEST_SELLERS_WINDOW_DAYS,
  HOMEPAGE_DEFAULT_CTA_HREF,
  HOMEPAGE_DEFAULT_CTA_LABEL,
  HOMEPAGE_DEFAULT_ITEM_LIMIT,
} from "@/features/homepage/constants";
import { getProducts, type Product } from "@/features/products/api/queries";
import { PROFIT_ORDER_STATUSES } from "@/features/reports/lib/constants";

/**
 * Homepage composition layer. Aggregates across products + categories, so it
 * lives above both leaves (importing them, never the reverse) to keep the
 * feature dependency graph acyclic.
 */

export interface HomepageCarouselSection {
  blockType: "carousel";
  ctaHref: Route;
  ctaLabel: string;
  id: string;
  products: Product[];
  sectionKey: null;
  sourceType: HomepageCarouselSourceType;
  title: string;
}

export interface HomepagePredefinedSection {
  blockType: Exclude<HomepageBlockType, "carousel">;
  id: string;
  sectionKey: string;
}

export type HomepageResolvedSection =
  | HomepageCarouselSection
  | HomepagePredefinedSection;

type HomepageSectionRow = Awaited<
  ReturnType<typeof getHomepageSectionRows>
>[number];

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
    .where(
      and(
        gte(orders.createdAt, since),
        inArray(orders.orderStatus, [...PROFIT_ORDER_STATUSES])
      )
    )
    .groupBy(orderItems.productId)
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(limit);

  return rows.map((row) => row.productId);
}

function isB2cEligibleProduct(product: Product) {
  return (
    product.isActive &&
    product.showInB2c &&
    product.status !== "draft" &&
    product.status !== "archived"
  );
}

function resolveCarouselCta(
  section: HomepageSectionRow,
  categorySlug: string | null
): { ctaHref: Route; ctaLabel: string } {
  const ctaLabel = section.ctaLabel ?? HOMEPAGE_DEFAULT_CTA_LABEL;

  if (section.ctaHref) {
    return { ctaHref: section.ctaHref as Route, ctaLabel };
  }

  if (section.sourceType === "category" && categorySlug) {
    return {
      ctaHref: getCategoriesLink({ category: categorySlug }),
      ctaLabel,
    };
  }

  return {
    ctaHref: HOMEPAGE_DEFAULT_CTA_HREF,
    ctaLabel,
  };
}

function resolveManualCarouselProducts(
  section: HomepageSectionRow,
  productMap: Map<string, Product>,
  itemLimit: number
) {
  const orderedIds = section.carouselProducts
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => row.productId);

  const products: Product[] = [];
  for (const productId of orderedIds) {
    const product = productMap.get(productId);
    if (product) {
      products.push(product);
    }
    if (products.length >= itemLimit) {
      break;
    }
  }
  return products;
}

function resolveCategoryCarouselProducts(
  section: HomepageSectionRow,
  eligibleProducts: Product[],
  itemLimit: number
) {
  if (!section.categoryId) {
    return [];
  }
  return eligibleProducts
    .filter((product) => product.categoryId === section.categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, itemLimit);
}

async function resolveBestSellerCarouselProducts(
  productMap: Map<string, Product>,
  itemLimit: number
) {
  const poolSize = itemLimit * HOMEPAGE_BEST_SELLER_POOL_MULTIPLIER;
  const topSellerIds = await getTopSellerIds(
    poolSize,
    HOMEPAGE_BEST_SELLERS_WINDOW_DAYS
  );
  const products: Product[] = [];
  for (const productId of topSellerIds) {
    const product = productMap.get(productId);
    if (product) {
      products.push(product);
    }
    if (products.length >= itemLimit) {
      break;
    }
  }
  return products;
}

async function resolveCarouselProducts(
  section: HomepageSectionRow,
  allProducts: Product[]
) {
  const itemLimit = section.itemLimit ?? HOMEPAGE_DEFAULT_ITEM_LIMIT;
  const eligibleProducts = allProducts.filter(isB2cEligibleProduct);
  const productMap = new Map(
    eligibleProducts.map((product) => [product.id, product])
  );

  if (section.sourceType === "manual_products") {
    return resolveManualCarouselProducts(section, productMap, itemLimit);
  }

  if (section.sourceType === "category") {
    return resolveCategoryCarouselProducts(
      section,
      eligibleProducts,
      itemLimit
    );
  }

  if (section.sourceType === "best_sellers") {
    return await resolveBestSellerCarouselProducts(productMap, itemLimit);
  }

  return [];
}

function isFeatureFlagAllowed(blockType: HomepageBlockType) {
  switch (blockType) {
    case "registration_reorder":
      return true;
    case "brand_story":
      return featureFlags.brandStorySection;
    case "game":
      return featureFlags.game;
    case "blog":
      return featureFlags.blog;
    case "b2b_cta":
      return featureFlags.b2b;
    default:
      return true;
  }
}

function getHomepageSectionRows() {
  return db.query.homepageSections.findMany({
    orderBy: (section, { asc }) => [asc(section.sortOrder), asc(section.id)],
    with: {
      category: {
        columns: {
          id: true,
          slug: true,
          name: true,
          isActive: true,
        },
      },
      carouselProducts: {
        columns: {
          productId: true,
          sortOrder: true,
        },
      },
    },
  });
}

async function resolveSections(
  rows: HomepageSectionRow[],
  options: { onlyEnabled: boolean }
): Promise<HomepageResolvedSection[]> {
  const allProducts = await getProducts();
  const resolved: HomepageResolvedSection[] = [];

  for (const row of rows) {
    if (options.onlyEnabled && !row.isEnabled) {
      continue;
    }
    if (options.onlyEnabled && !isFeatureFlagAllowed(row.blockType)) {
      continue;
    }

    if (row.blockType !== "carousel") {
      resolved.push({
        id: row.id,
        sectionKey: row.sectionKey ?? row.blockType,
        blockType: row.blockType,
      });
      continue;
    }

    if (!row.sourceType) {
      continue;
    }

    const products = await resolveCarouselProducts(row, allProducts);
    if (options.onlyEnabled && products.length === 0) {
      continue;
    }

    const categorySlug =
      row.category?.isActive === false ? null : (row.category?.slug ?? null);
    const cta = resolveCarouselCta(row, categorySlug);

    resolved.push({
      id: row.id,
      sectionKey: null,
      blockType: "carousel",
      title: row.title ?? "Produkty",
      ctaLabel: cta.ctaLabel,
      ctaHref: cta.ctaHref,
      sourceType: row.sourceType,
      products,
    });
  }

  return resolved;
}

export const getHomepageLayout = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("homepage-layout");

  const rows = await getHomepageSectionRows();
  return resolveSections(rows, { onlyEnabled: true });
});

export async function getAdminHomepageSections() {
  const rows = await getHomepageSectionRows();
  const allProducts = await getProducts();

  return Promise.all(
    rows.map(async (row) => {
      const base = {
        id: row.id,
        sectionKey: row.sectionKey,
        blockType: row.blockType,
        isEnabled: row.isEnabled,
        sortOrder: row.sortOrder,
        title: row.title,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
        sourceType: row.sourceType,
        categoryId: row.categoryId,
        categoryName: row.category?.name ?? null,
        categorySlug: row.category?.slug ?? null,
        itemLimit: row.itemLimit,
        manualProductIds: row.carouselProducts
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => item.productId),
      };

      if (row.blockType !== "carousel" || !row.sourceType) {
        return {
          ...base,
          previewProducts: [] as Product[],
        };
      }

      const previewProducts = await resolveCarouselProducts(row, allProducts);
      return {
        ...base,
        previewProducts,
      };
    })
  );
}

export type AdminHomepageSection = Awaited<
  ReturnType<typeof getAdminHomepageSections>
>[number];

export async function getHomepageCarouselSectionById(sectionId: string) {
  const row = await db.query.homepageSections.findFirst({
    where: eq(homepageSections.id, sectionId),
    with: {
      carouselProducts: {
        columns: {
          productId: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!row || row.blockType !== "carousel" || !row.sourceType) {
    return null;
  }

  return {
    id: row.id,
    blockType: "carousel" as const,
    isEnabled: row.isEnabled,
    title: row.title,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    sourceType: row.sourceType,
    categoryId: row.categoryId,
    itemLimit: row.itemLimit,
    manualProductIds: row.carouselProducts
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.productId),
  };
}

export async function getNextCarouselSortOrder() {
  const rows = await db
    .select({ sortOrder: homepageSections.sortOrder })
    .from(homepageSections)
    .orderBy(desc(homepageSections.sortOrder))
    .limit(1);

  return (rows[0]?.sortOrder ?? -1) + 1;
}
