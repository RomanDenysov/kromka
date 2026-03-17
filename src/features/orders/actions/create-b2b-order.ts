"use server";

// TODO: B2B checkout - re-enable when needed
// B2B order creation is disabled while we focus on B2C first.
// See: create-b2b-order.ts.disabled for the original implementation.

import type { PaymentMethod } from "@/db/types";

type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

/**
 * Create B2B order from cart.
 * Currently disabled - B2B checkout is not yet available.
 */
// biome-ignore lint/suspicious/useAwait: server action must be async
export async function createB2BOrder(_data: {
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
}): Promise<CreateOrderResult> {
  return {
    success: false,
    error: "B2B objednávky nie sú momentálne dostupné.",
  };
}
