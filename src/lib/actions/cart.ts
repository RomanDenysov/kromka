// lib/actions/cart.ts
"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cartItems, carts } from "@/db/schema";
import { getCartIdFromCookie, setCartIdCookie } from "../cart/cookies";

export async function addToCart(productId: string, quantity: number) {
  let cartId: string | null = null;
  const prevCartId = await getCartIdFromCookie();
  if (prevCartId) {
    cartId = prevCartId;
  } else {
    const [newCart] = await db
      .insert(carts)
      .values({})
      .returning({ id: carts.id });
    cartId = newCart.id;
    await setCartIdCookie(cartId);
  }

  // Upsert cart item
  await db
    .insert(cartItems)
    .values({ cartId, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { quantity: sql`${cartItems.quantity} + ${quantity}` },
    });

  revalidatePath("/", "layout");
}

export async function removeFromCart(productId: string) {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    throw new Error("Cart not found");
  }

  await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
    );

  revalidatePath("/", "layout");
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
) {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    throw new Error("Cart not found");
  }
  if (quantity < 0) {
    throw new Error("Invalid quantity");
  }

  if (quantity === 0) {
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      );
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      );
  }

  revalidatePath("/", "layout");
}
