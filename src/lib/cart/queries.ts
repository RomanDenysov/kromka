import "server-only";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getCart } from "./cookies";

export async function getDetailedCart() {
  const cart = await getCart();

  if (cart.length === 0) {
    return [];
  }

  const productData = await db.query.products.findMany({
    where: inArray(
      products.id,
      cart.map((i) => i.productId)
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
    },
    with: {
      image: {
        columns: { url: true },
      },
      category: {
        columns: { name: true, pickupDates: true },
      },
    },
  });

  return cart
    .map((item) => {
      const product = productData.find((p) => p.id === item.productId);

      if (!product) {
        return null;
      }

      return {
        productId: item.productId,
        quantity: item.qty,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        imageUrl: product.image?.url ?? null,
        category: product.category,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
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
