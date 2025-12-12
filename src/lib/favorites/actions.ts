"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { getAuth } from "../auth/session";

export async function toggleFavorite(productId: string) {
  const { user } = await getAuth();

  if (!user) {
    return { success: false, error: "UNAUTHORIZED" as const };
  }

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

  return { success: true };
}

export async function isFavorite(productId: string): Promise<boolean> {
  const { user } = await getAuth();

  if (!user) {
    return false;
  }

  const favorite = await db.query.favorites.findFirst({
    where: and(
      eq(favorites.userId, user.id),
      eq(favorites.productId, productId)
    ),
  });

  return !!favorite;
}
