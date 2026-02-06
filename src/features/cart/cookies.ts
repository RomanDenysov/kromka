import { cookies } from "next/headers";
import { type CartItem, cartSchema } from "./schema";

const CART_COOKIE = "krmk-kosik";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getCart(): Promise<CartItem[]> {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  if (!raw) {
    return [];
  }

  try {
    return cartSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function setCart(items: CartItem[]): Promise<void> {
  (await cookies()).set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearCart(): Promise<void> {
  (await cookies()).delete(CART_COOKIE);
}

const B2B_CART_COOKIE = "krmk-kosik-b2b";

export async function getB2bCart(): Promise<CartItem[]> {
  const raw = (await cookies()).get(B2B_CART_COOKIE)?.value;
  if (!raw) {
    return [];
  }

  try {
    return cartSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function setB2bCart(items: CartItem[]): Promise<void> {
  (await cookies()).set(B2B_CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearB2bCart(): Promise<void> {
  (await cookies()).delete(B2B_CART_COOKIE);
}
