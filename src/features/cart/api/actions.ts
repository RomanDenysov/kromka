"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  clearB2bCart as clearB2bCartCookie,
  clearCart as clearCartCookie,
  getB2bCart,
  getCart,
  setB2bCart,
  setCart,
} from "@/features/cart/cookies";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive().default(1),
});

const updateQuantitySchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int(),
});

export async function addToCart(productId: string, qty = 1) {
  const parsed = addToCartSchema.safeParse({ productId, qty });
  if (!parsed.success) {
    throw new Error("Invalid cart input");
  }

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
  const parsed = updateQuantitySchema.safeParse({ productId, qty });
  if (!parsed.success) {
    throw new Error("Invalid cart input");
  }

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
}

export async function addToB2bCart(productId: string, qty = 1) {
  const parsed = addToCartSchema.safeParse({ productId, qty });
  if (!parsed.success) {
    throw new Error("Invalid cart input");
  }

  const cart = await getB2bCart();
  const existingIndex = cart.findIndex((item) => item.productId === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ productId, qty });
  }

  await setB2bCart(cart);
  refresh();
}

export async function updateB2bQuantity(productId: string, qty: number) {
  const parsed = updateQuantitySchema.safeParse({ productId, qty });
  if (!parsed.success) {
    throw new Error("Invalid cart input");
  }

  const cart = await getB2bCart();

  if (qty <= 0) {
    await setB2bCart(cart.filter((item) => item.productId !== productId));
  } else {
    await setB2bCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      )
    );
  }

  refresh();
}

export async function removeFromB2bCart(productId: string) {
  const cart = await getB2bCart();
  await setB2bCart(cart.filter((item) => item.productId !== productId));
  refresh();
}

export async function clearB2bCartAction() {
  await clearB2bCartCookie();
  refresh();
}

export async function addItemsToB2bCart(
  items: { productId: string; quantity: number }[]
) {
  if (items.length === 0) {
    return;
  }

  const cart = await getB2bCart();

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

  await setB2bCart(cart);
  refresh();
}
