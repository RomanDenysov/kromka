"use server";

import { getUser } from "@/lib/auth/session";
import { setLastOrderId } from "../cookies";
import {
  getLastOrderPrefill,
  getLastOrderWithItems,
  type LastOrderPrefill,
  type LastOrderWithItems,
} from "./queries";

/**
 * Server action: Get last order prefill data
 * Derives userId from session internally to prevent IDOR
 */
export async function getLastOrderPrefillAction(): Promise<LastOrderPrefill | null> {
  try {
    const user = await getUser();
    return await getLastOrderPrefill(user?.id);
  } catch (error) {
    console.error("Failed to get last order prefill:", error);
    return null;
  }
}

/**
 * Server action: Get last order with items for "repeat order" feature
 * Derives userId from session internally to prevent IDOR
 */
export async function getLastOrderWithItemsAction(): Promise<LastOrderWithItems | null> {
  try {
    const user = await getUser();
    return await getLastOrderWithItems(user?.id);
  } catch (error) {
    console.error("Failed to get last order with items:", error);
    return null;
  }
}

/**
 * Server action: Set last order ID in cookie (for guests)
 * Called after successful order creation
 */
export async function setLastOrderIdAction(orderId: string): Promise<void> {
  try {
    await setLastOrderId(orderId);
  } catch (error) {
    console.error("Failed to set last order ID:", error);
  }
}
