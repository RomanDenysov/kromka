"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearCart as clearCartCookie,
  getCart,
  setCart,
} from "@/features/cart/cookies";

export async function addToCart(productId: string, qty = 1) {
  const cart = await getCart();

  const existingIndex = cart.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ productId, qty });
  }

  await setCart(cart);

  refresh();
}

export async function updateQuantity(productId: string, qty: number) {
  const cart = await getCart();

  if (qty <= 0) {
    await setCart(cart.filter((item) => item.productId !== productId));
  } else {
    await setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      )
    );
  }

  refresh();
}

export async function removeFromCart(productId: string) {
  const cart = await getCart();
  await setCart(cart.filter((item) => item.productId !== productId));
  refresh();
}

export async function clearCart() {
  await clearCartCookie();
  refresh();
}

/**
 * Add multiple items to cart and redirect to checkout
 * Used by the "repeat order" feature to add all items from last order at once
 */
export async function addItemsToCart(
  items: { productId: string; quantity: number }[]
) {
  if (items.length === 0) {
    return;
  }

  const cart = await getCart();

  // Merge items into cart, updating quantities for existing items
  for (const item of items) {
    const existingIndex = cart.findIndex(
      (ci) => ci.productId === item.productId
    );

    if (existingIndex >= 0) {
      cart[existingIndex].qty += item.quantity;
    } else {
      cart.push({ productId: item.productId, qty: item.quantity });
    }
  }

  await setCart(cart);
  refresh();

  // Redirect to checkout after items added
  redirect("/pokladna");
}
