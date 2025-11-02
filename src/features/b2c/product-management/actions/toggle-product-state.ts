"use server";

import { eq, not } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

const pendingToggles = new Map<string, Promise<void>>();

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function toggleProductState(productId: string) {
  // Если уже идет toggle для этого продукта - возвращаем существующий промис
  if (pendingToggles.has(productId)) {
    return pendingToggles.get(productId);
  }

  const togglePromise = (async () => {
    try {
      await db
        .update(products)
        .set({
          isActive: not(products.isActive),
        })
        .where(eq(products.id, productId));
    } finally {
      pendingToggles.delete(productId);
    }
  })();

  pendingToggles.set(productId, togglePromise);
  return togglePromise;
}
