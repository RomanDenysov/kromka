import "server-only";

import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { db } from "@/db";
import { productPrelinks } from "@/db/schema";

export interface PrelinkWithLinkedProduct {
  label: string | null;
  linkedProduct: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    isActive: boolean;
    status: string;
    weightValue: number | null;
    weightUnit: string | null;
    imageUrl: string | null;
  };
  linkedProductId: string;
  productId: string;
  sortOrder: number;
}

/**
 * Prelinks for the customer-facing PDP. Filters out inactive/draft/archived
 * linked products so the panel never surfaces something the customer can't buy.
 */
export const getPrelinksByProductId = cache(async (productId: string) => {
  "use cache";
  cacheLife("max");
  cacheTag("product-prelinks", `product-prelinks-${productId}`);

  const rows = await db.query.productPrelinks.findMany({
    where: eq(productPrelinks.productId, productId),
    orderBy: [asc(productPrelinks.sortOrder), asc(productPrelinks.createdAt)],
    with: {
      linkedProduct: {
        columns: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          isActive: true,
          status: true,
          weightValue: true,
          weightUnit: true,
        },
        with: { image: { columns: { url: true } } },
      },
    },
  });

  return rows
    .filter(
      (r) =>
        r.linkedProduct.isActive &&
        r.linkedProduct.status !== "draft" &&
        r.linkedProduct.status !== "archived"
    )
    .map((r) => ({
      productId: r.productId,
      linkedProductId: r.linkedProductId,
      label: r.label,
      sortOrder: r.sortOrder,
      linkedProduct: {
        id: r.linkedProduct.id,
        name: r.linkedProduct.name,
        slug: r.linkedProduct.slug,
        priceCents: r.linkedProduct.priceCents,
        isActive: r.linkedProduct.isActive,
        status: r.linkedProduct.status,
        weightValue: r.linkedProduct.weightValue,
        weightUnit: r.linkedProduct.weightUnit,
        imageUrl: r.linkedProduct.image?.url ?? null,
      },
    })) satisfies PrelinkWithLinkedProduct[];
});

/**
 * Admin view: returns every prelink regardless of linked product status, with
 * minimal product fields needed for the admin form list.
 */
export async function getAdminPrelinksByProductId(productId: string) {
  const rows = await db.query.productPrelinks.findMany({
    where: eq(productPrelinks.productId, productId),
    orderBy: [asc(productPrelinks.sortOrder), asc(productPrelinks.createdAt)],
    with: {
      linkedProduct: {
        columns: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          isActive: true,
          status: true,
        },
      },
    },
  });
  return rows;
}
