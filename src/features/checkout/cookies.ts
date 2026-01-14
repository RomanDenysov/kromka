import { cookies } from "next/headers";

// Constants
const GUEST_INFO_COOKIE = "krmk-guest";
const SELECTED_STORE_COOKIE = "krmk-store";
const ORDER_HISTORY_COOKIE = "krmk-orders";

const GUEST_INFO_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const STORE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year (persists across sessions)
const ORDER_HISTORY_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const MAX_ORDER_HISTORY_SIZE = 10;

/**
 * Guest customer information stored in httpOnly cookie
 * Contains name, email, phone - cleared after successful order
 */
export type GuestInfo = {
  name: string;
  email: string;
  phone: string;
};

/**
 * Selected store info stored in httpOnly cookie
 * Persists across sessions for convenient store selection
 */
export type SelectedStore = {
  id: string;
  name: string;
};

// ============================================================================
// Guest Info (PII) - httpOnly, cleared after order
// ============================================================================

export async function getGuestInfo(): Promise<GuestInfo | null> {
  const raw = (await cookies()).get(GUEST_INFO_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw);
    // Validate shape
    if (data.name && data.email && data.phone) {
      return data as GuestInfo;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setGuestInfo(info: GuestInfo): Promise<void> {
  (await cookies()).set(GUEST_INFO_COOKIE, JSON.stringify(info), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GUEST_INFO_MAX_AGE,
    path: "/",
  });
}

export async function clearGuestInfo(): Promise<void> {
  (await cookies()).delete(GUEST_INFO_COOKIE);
}

// ============================================================================
// Selected Store - httpOnly, persists across sessions
// ============================================================================

export async function getSelectedStore(): Promise<SelectedStore | null> {
  const raw = (await cookies()).get(SELECTED_STORE_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw);
    if (data.id && data.name) {
      return data as SelectedStore;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSelectedStore(store: SelectedStore): Promise<void> {
  (await cookies()).set(SELECTED_STORE_COOKIE, JSON.stringify(store), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: STORE_MAX_AGE,
    path: "/",
  });
}

export async function clearSelectedStore(): Promise<void> {
  (await cookies()).delete(SELECTED_STORE_COOKIE);
}

// ============================================================================
// Order History - httpOnly, for pre-fill and "repeat order" feature
// ============================================================================

export async function getOrderHistory(): Promise<string[]> {
  const raw = (await cookies()).get(ORDER_HISTORY_COOKIE)?.value;
  if (!raw) {
    return [];
  }

  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.every((id) => typeof id === "string")) {
      return data as string[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Add a new order ID to the history, keeping only the most recent MAX_ORDER_HISTORY_SIZE
 * Ensures the new order is at the front of the array
 */
export async function addOrderToHistory(orderId: string): Promise<void> {
  const current = await getOrderHistory();

  // Remove duplicate if it exists, then add to front
  const updated = [orderId, ...current.filter((id) => id !== orderId)].slice(
    0,
    MAX_ORDER_HISTORY_SIZE
  );

  (await cookies()).set(ORDER_HISTORY_COOKIE, JSON.stringify(updated), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ORDER_HISTORY_MAX_AGE,
    path: "/",
  });
}

export async function clearOrderHistory(): Promise<void> {
  (await cookies()).delete(ORDER_HISTORY_COOKIE);
}
