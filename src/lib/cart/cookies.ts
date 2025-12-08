import { cookies } from "next/headers";

const CART_ID_COOKIE_NAME = "cart_id";
// biome-ignore lint/style/noMagicNumbers: <explanation>
const CART_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Get cart ID from cookies (for guest carts)
 */
export async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_ID_COOKIE_NAME)?.value ?? null;
}

/**
 * Set cart ID in cookies (for guest carts)
 */
export async function setCartIdCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_ID_COOKIE_NAME, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_ID_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear cart ID cookie
 */
export async function clearCartIdCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_ID_COOKIE_NAME);
}
