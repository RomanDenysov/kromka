"use server";

import { refresh } from "next/cache";
import { clearCart as clearCartCookie, getCart, setCart } from "./cookies";

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
