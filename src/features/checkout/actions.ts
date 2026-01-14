"use server";

import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { GuestCustomerInfo } from "@/features/orders/actions";
import {
  addOrderToHistory,
  clearGuestInfo,
  clearSelectedStore,
  type GuestInfo,
  getGuestInfo,
  getOrderHistory,
  getSelectedStore,
  type SelectedStore,
  setGuestInfo,
  setSelectedStore,
} from "./cookies";

/**
 * Save guest info to secure httpOnly cookie
 * Called on form changes (debounced from client)
 */
export async function saveGuestInfoAction(
  info: GuestInfo
): Promise<{ success: boolean; error?: string }> {
  try {
    await setGuestInfo(info);
    return { success: true };
  } catch (error) {
    console.error("Failed to save guest info:", error);
    return { success: false, error: "Chyba pri ukladaní údajov" };
  }
}

/**
 * Get current guest info from cookie
 */
export async function getGuestInfoAction(): Promise<GuestInfo | null> {
  try {
    return await getGuestInfo();
  } catch (error) {
    console.error("Failed to get guest info:", error);
    return null;
  }
}

/**
 * Clear guest info after successful order
 */
export async function clearGuestInfoAction(): Promise<void> {
  try {
    await clearGuestInfo();
  } catch (error) {
    console.error("Failed to clear guest info:", error);
  }
}

/**
 * Save selected store to cookie
 */
export async function saveSelectedStoreAction(
  store: SelectedStore
): Promise<{ success: boolean; error?: string }> {
  try {
    await setSelectedStore(store);
    return { success: true };
  } catch (error) {
    console.error("Failed to save selected store:", error);
    return { success: false, error: "Chyba pri ukladaní predajne" };
  }
}

/**
 * Get currently selected store from cookie
 */
export async function getSelectedStoreAction(): Promise<SelectedStore | null> {
  try {
    return await getSelectedStore();
  } catch (error) {
    console.error("Failed to get selected store:", error);
    return null;
  }
}

/**
 * Clear selected store from cookie
 */
export async function clearSelectedStoreAction(): Promise<void> {
  try {
    await clearSelectedStore();
  } catch (error) {
    console.error("Failed to clear selected store:", error);
  }
}

/**
 * Get the most recent order info from order history
 * Used to pre-fill guest form on return visits
 */
export async function getLastOrderInfoAction(): Promise<GuestCustomerInfo | null> {
  try {
    const history = await getOrderHistory();
    if (history.length === 0) {
      return null;
    }

    // Fetch the most recent order from history
    const lastOrder = await db.query.orders.findFirst({
      where: inArray(orders.id, history),
      orderBy: [desc(orders.createdAt)],
      columns: {
        customerInfo: true,
      },
    });

    const customerInfo = lastOrder?.customerInfo;
    if (
      !customerInfo ||
      typeof customerInfo.email !== "string" ||
      typeof customerInfo.phone !== "string"
    ) {
      return null;
    }

    return {
      name: customerInfo.name ?? "",
      email: customerInfo.email,
      phone: customerInfo.phone,
    };
  } catch (error) {
    console.error("Failed to get last order info:", error);
    return null;
  }
}

/**
 * Add an order ID to the guest's order history
 * Called after successful order creation
 */
export async function addOrderToHistoryAction(orderId: string): Promise<void> {
  try {
    await addOrderToHistory(orderId);
  } catch (error) {
    console.error("Failed to add order to history:", error);
  }
}

/**
 * Get the full order history (list of order IDs)
 */
export async function getOrderHistoryAction(): Promise<string[]> {
  try {
    return await getOrderHistory();
  } catch (error) {
    console.error("Failed to get order history:", error);
    return [];
  }
}

/**
 * Get the most recent order with all item details for "repeat order" feature
 * Returns items with current product prices, filtering out deleted/unavailable products
 */
export async function getLastOrderWithItemsAction() {
  try {
    const history = await getOrderHistory();
    if (history.length === 0) {
      return null;
    }

    // Fetch the most recent order with all items and product details
    const lastOrder = await db.query.orders.findFirst({
      where: inArray(orders.id, history),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                priceCents: true,
                status: true,
              },
              with: {
                image: {
                  columns: {
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lastOrder?.items || lastOrder.items.length === 0) {
      return null;
    }

    // Filter out unavailable products (draft status means not yet published)
    const availableItems = lastOrder.items.filter(
      (item) => item.product && item.product.status !== "draft"
    );

    if (availableItems.length === 0) {
      return null;
    }

    return {
      orderId: lastOrder.id,
      items: availableItems
        .map((item) => {
          const product = item.product;
          if (!product) {
            return null;
          }
          return {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            priceCents: product.priceCents,
            imageUrl: product.image?.url ?? null,
            quantity: item.quantity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    };
  } catch (error) {
    console.error("Failed to get last order with items:", error);
    return null;
  }
}
