"use server";

import { setLastOrderId } from "./cookies";
import {
  getLastOrderPrefill,
  getLastOrderWithItems,
  type LastOrderPrefill,
  type LastOrderWithItems,
} from "./queries";

/**
 * Server action: Get last order prefill data
 * Wraps query with error handling for client consumption
 */
export async function getLastOrderPrefillAction(
  userId?: string
): Promise<LastOrderPrefill | null> {
  try {
    return await getLastOrderPrefill(userId);
  } catch (error) {
    console.error("Failed to get last order prefill:", error);
    return null;
  }
}

/**
 * Server action: Get last order with items for "repeat order" feature
 * Wraps query with error handling for client consumption
 */
export async function getLastOrderWithItemsAction(
  userId?: string
): Promise<LastOrderWithItems | null> {
  try {
    return await getLastOrderWithItems(userId);
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
