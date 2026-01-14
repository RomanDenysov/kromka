import { cookies } from "next/headers";

// Constants
const LAST_ORDER_COOKIE = "krmk-last-order";
const LAST_ORDER_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// ============================================================================
// Last Order ID - httpOnly, for prefill and "repeat order" feature
// Stores only the most recent order ID for guests
// ============================================================================

/**
 * Get the last order ID from cookie (for guests)
 * Returns null if no order ID is stored
 */
export async function getLastOrderId(): Promise<string | null> {
  const raw = (await cookies()).get(LAST_ORDER_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    // Validate it's a non-empty string
    if (typeof raw === "string" && raw.trim().length > 0) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set the last order ID in cookie (replaces any previous value)
 * Called after successful order creation for guests
 */
export async function setLastOrderId(orderId: string): Promise<void> {
  (await cookies()).set(LAST_ORDER_COOKIE, orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: LAST_ORDER_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the last order ID cookie
 */
export async function clearLastOrderId(): Promise<void> {
  (await cookies()).delete(LAST_ORDER_COOKIE);
}
