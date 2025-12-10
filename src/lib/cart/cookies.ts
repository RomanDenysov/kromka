import { cookies } from "next/headers";
import { type CartItem, cartSchema } from "./schema";

const CART_COOKIE = "krmk-kosik";
// biome-ignore lint/style/noMagicNumbers: ignore it for now
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
