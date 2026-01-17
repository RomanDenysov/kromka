import { cookies } from "next/headers";

const LAST_ORDER_COOKIE = "krmk-last-order";
const LAST_ORDER_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

/** Get the last order ID from cookie (for guests) */
export async function getLastOrderId(): Promise<string | null> {
  const value = (await cookies()).get(LAST_ORDER_COOKIE)?.value?.trim();
  return value || null;
}

/** Set the last order ID in cookie (replaces any previous value) */
export async function setLastOrderId(orderId: string): Promise<void> {
  (await cookies()).set(LAST_ORDER_COOKIE, orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: LAST_ORDER_MAX_AGE_SECONDS,
    path: "/",
  });
}

/** Clear the last order ID cookie */
export async function clearLastOrderId(): Promise<void> {
  (await cookies()).delete(LAST_ORDER_COOKIE);
}
