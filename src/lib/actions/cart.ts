"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts } from "@/db/schema";
import { getCartIdFromCookie, setCartIdCookie } from "../cart/cookies";
import { getCart } from "../queries/cart";

async function getOrCreateCartId(): Promise<string> {
  const cartId = await getCartIdFromCookie();

  if (cartId) {
    // Проверяем, жива ли корзина в БД
    const existingCart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      columns: { id: true }, // Нам нужен только ID, экономим трафик
    });

    if (existingCart) {
      return existingCart.id;
    }
  }

  // Создаем новую, если куки нет или корзина удалена
  const [newCart] = await db
    .insert(carts)
    .values({})
    .returning({ id: carts.id });
  await setCartIdCookie(newCart.id);
  return newCart.id;
}

export async function addToCart(productId: string, quantity: number) {
  if (quantity <= 0) {
    return { error: "Quantity must be positive" };
  }

  const cartId = await getOrCreateCartId();

  // Upsert cart item
  await db
    .insert(cartItems)
    .values({ cartId, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { quantity: sql`${cartItems.quantity} + ${quantity}` },
    });

  return getCart();
}

export async function removeFromCart(productId: string) {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return { error: "Cart not found" };
  }

  await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
    );

  return getCart();
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number
) {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    throw new Error("Cart not found");
  }
  if (quantity <= 0) {
    // Delete item if quantity is 0 or less
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      );
  } else {
    // Update item quantity if it's positive
    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      );
  }

  return getCart();
}
