"use server";

import type { PaymentMethod } from "@/db/types";
import { getUser, getUserDetails } from "@/lib/auth/session";
import { createB2BOrder } from "./create-b2b-order";
import { createB2COrder } from "./create-b2c-order";
import type { GuestCustomerInfo } from "./internal";

type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

/**
 * @deprecated Use createB2COrder or createB2BOrder instead.
 * This function is kept for backward compatibility and will route to the appropriate action.
 */
export async function createOrderFromCart(data: {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  customerInfo: GuestCustomerInfo;
}): Promise<CreateOrderResult> {
  const user = await getUser();
  const userDetails = user ? await getUserDetails() : null;
  const isB2B =
    userDetails?.members && userDetails.members.length > 0
      ? Boolean(userDetails.members[0]?.organization)
      : false;

  // Route to appropriate action based on B2B status
  if (isB2B) {
    return createB2BOrder(data);
  }

  // B2C: reject invoice payment method
  if (data.paymentMethod === "invoice") {
    return {
      success: false,
      error: "Platba na faktúru je dostupná len pre B2B zákazníkov",
    };
  }

  return createB2COrder({
    ...data,
    paymentMethod: data.paymentMethod as Exclude<PaymentMethod, "invoice">,
  });
}
