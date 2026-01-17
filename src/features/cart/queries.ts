import "server-only";

import { and, eq, inArray, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCart } from "@/features/cart/cookies";

/**
 * Get detailed cart items with product data.
 * Filters out unavailable products (inactive, draft, archived, or in inactive category).
 * Note: This is a pure query - unavailable items are filtered from results but not
 * removed from the cookie. Cookie cleanup happens lazily via cart actions.
 */
export async function getDetailedCart() {
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

  return cart.flatMap((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      return [];
    }
    return [
      {
        productId: item.productId,
        quantity: item.qty,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        imageUrl: product.image?.url ?? null,
        category: product.category,
      },
    ];
  });
}

export type DetailedCartItem = NonNullable<
  Awaited<ReturnType<typeof getDetailedCart>>[number]
>;

export function getCartTotals(items: DetailedCartItem[]) {
  return {
    totalCents: items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    ),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
