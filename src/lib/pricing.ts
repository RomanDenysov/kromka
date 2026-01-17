import "server-only";

import { db } from "@/db";

/**
 * Get effective price for a product based on price tier.
 * Returns tier price if available, otherwise base product price.
 */
export async function getEffectivePrice({
  productId,
  basePriceCents,
  priceTierId,
}: {
  productId: string;
  basePriceCents: number;
  priceTierId?: string | null;
}): Promise<number> {
  if (!priceTierId) {
    return basePriceCents;
  }

  const tierPrice = await db.query.prices.findFirst({
    where: (p, { and, eq: eqOp }) =>
      and(eqOp(p.productId, productId), eqOp(p.priceTierId, priceTierId)),
    columns: { priceCents: true },
  });

  return tierPrice?.priceCents ?? basePriceCents;
}

/**
 * Get effective prices for multiple products in batch.
 * More efficient than calling getEffectivePrice multiple times.
 */
export async function getEffectivePrices({
  productPrices,
  priceTierId,
}: {
  productPrices: Array<{ productId: string; basePriceCents: number }>;
  priceTierId?: string | null;
}): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  if (!priceTierId || productPrices.length === 0) {
    for (const { productId, basePriceCents } of productPrices) {
      result.set(productId, basePriceCents);
    }
    return result;
  }

  const productIds = productPrices.map((p) => p.productId);
  const tierPrices = await db.query.prices.findMany({
    where: (p, { and, eq: eqOp, inArray }) =>
      and(eqOp(p.priceTierId, priceTierId), inArray(p.productId, productIds)),
    columns: { productId: true, priceCents: true },
  });

  const tierPriceMap = new Map(
    tierPrices.map((tp) => [tp.productId, tp.priceCents])
  );

  for (const { productId, basePriceCents } of productPrices) {
    result.set(productId, tierPriceMap.get(productId) ?? basePriceCents);
  }

  return result;
}

/**
 * Check if a product has a tier price (different from base price).
 */
export async function hasTierPrice({
  productId,
  basePriceCents,
  priceTierId,
}: {
  productId: string;
  basePriceCents: number;
  priceTierId?: string | null;
}): Promise<boolean> {
  if (!priceTierId) {
    return false;
  }

  const effectivePrice = await getEffectivePrice({
    productId,
    basePriceCents,
    priceTierId,
  });

  return effectivePrice !== basePriceCents;
}
