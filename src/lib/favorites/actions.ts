"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { requireAuth } from "../auth/guards";

export async function toggleFavorite(productId: string) {
  const user = await requireAuth();

  const existing = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, user.id),
      eq(favorites.productId, productId)
    ),
  });

  if (existing) {
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, user.id), eq(favorites.productId, productId))
      );
  } else {
    await db.insert(favorites).values({
      userId: user.id,
      productId,
    });
  }
  refresh();
  return { success: true };
}

export async function isFavorite(productId: string): Promise<boolean> {
  const user = await requireAuth();

  const favorite = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, user.id),
      eq(favorites.productId, productId)
    ),
  });

  return !!favorite;
}
