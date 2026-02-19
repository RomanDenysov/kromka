import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getProducts } from "@/features/products/api/queries";
import { getUser } from "@/lib/auth/session";

export const getFavoriteIds = cache(async (): Promise<string[]> => {
  const user = await getUser();

  if (!user) {
    return [];
  }

  const userFavorites = await db.query.favorites.findMany({
    where: eq(favorites.userId, user.id),
    columns: { productId: true },
    orderBy: desc(favorites.createdAt),
  });

  return userFavorites.map((f) => f.productId);
});

export const getFavorites = cache(async () => {
  const productIds = await getFavoriteIds();

  if (productIds.length === 0) {
    return [];
  }

  const allProducts = await getProducts();
  return allProducts.filter((p) => productIds.includes(p.id));
});

export async function getFavoritesCount(): Promise<number> {
  const user = await getUser();

  if (!user) {
    return 0;
  }

  const [result] = await db
    .select({ count: count() })
    .from(favorites)
    .where(eq(favorites.userId, user.id));

  return result?.count ?? 0;
}

// biome-ignore lint/complexity/noVoid: We need to preload the favorites for the server component
export const preloadFavorites = () => void getFavorites();
