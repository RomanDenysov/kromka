import "server-only";

import { cache } from "react";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getB2bCart, getCart } from "@/features/cart/cookies";
import { getEffectivePrices } from "@/lib/pricing";

/**
 * Get detailed cart items with product data.
 * Filters out unavailable products (inactive, draft, archived, or in inactive category).
 * Optionally applies tier pricing for B2B users.
 * Note: This is a pure query - unavailable items are filtered from results but not
 * removed from the cookie. Cookie cleanup happens lazily via cart actions.
 */
export const getDetailedCart = cache(async function getDetailedCart(priceTierId?: string | null) {
  const cart = await getCart();

  if (cart.length === 0) {
    return [];
  }

  const productData = await db.query.products.findMany({
    where: and(
      inArray(
        products.id,
        cart.map((i) => i.productId)
      ),
      eq(products.isActive, true),
      notInArray(products.status, ["draft", "archived"])
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      isActive: true,
      status: true,
    },
    with: {
      image: {
        columns: { url: true },
      },
      category: {
        columns: { name: true, pickupDates: true, isActive: true },
      },
    },
  });

  const productById = new Map(
    productData
      .filter(
        (p) =>
          p.isActive && p.status === "active" && p.category?.isActive !== false
      )
      .map((p) => [p.id, p])
  );

  // Get effective prices if tier is provided
  const productPrices = Array.from(productById.values()).map((p) => ({
    productId: p.id,
    basePriceCents: p.priceCents,
  }));

  const effectivePrices =
    priceTierId && productPrices.length > 0
      ? await getEffectivePrices({ productPrices, priceTierId })
      : new Map<string, number>();

  return cart.flatMap((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      return [];
    }
    const effectivePrice =
      effectivePrices.get(product.id) ?? product.priceCents;
    return [
      {
        productId: item.productId,
        quantity: item.qty,
        name: product.name,
        slug: product.slug,
        priceCents: effectivePrice,
        imageUrl: product.image?.url ?? null,
        category: product.category,
      },
    ];
  });
});

export type DetailedCartItem = NonNullable<
  Awaited<ReturnType<typeof getDetailedCart>>[number]
>;

export const getDetailedB2bCart = cache(async function getDetailedB2bCart(priceTierId: string | null) {
  const cart = await getB2bCart();

  if (cart.length === 0) {
    return [];
  }

  const productData = await db.query.products.findMany({
    where: and(
      inArray(
        products.id,
        cart.map((i) => i.productId)
      ),
      eq(products.isActive, true),
      notInArray(products.status, ["draft", "archived"])
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      isActive: true,
      status: true,
    },
    with: {
      image: {
        columns: { url: true },
      },
      category: {
        columns: { name: true, pickupDates: true, isActive: true },
      },
    },
  });

  const productById = new Map(
    productData
      .filter(
        (p) =>
          p.isActive && p.status === "active" && p.category?.isActive !== false
      )
      .map((p) => [p.id, p])
  );

  const productPrices = Array.from(productById.values()).map((p) => ({
    productId: p.id,
    basePriceCents: p.priceCents,
  }));

  const effectivePrices =
    priceTierId && productPrices.length > 0
      ? await getEffectivePrices({ productPrices, priceTierId })
      : new Map<string, number>();

  return cart.flatMap((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      return [];
    }
    const effectivePrice =
      effectivePrices.get(product.id) ?? product.priceCents;
    return [
      {
        productId: item.productId,
        quantity: item.qty,
        name: product.name,
        slug: product.slug,
        priceCents: effectivePrice,
        imageUrl: product.image?.url ?? null,
        category: product.category,
      },
    ];
  });
});

export function getCartTotals(items: DetailedCartItem[]) {
  return {
    totalCents: items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    ),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
