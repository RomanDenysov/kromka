"use server";

import type { PaymentMethod } from "@/db/types";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { getUser } from "@/lib/auth/session";
import { setLastOrderIdAction } from "../../checkout/api/actions";
import {
  buildOrderItems,
  clearCartAfterOrder,
  type GuestCustomerInfo,
  isValidGuestInfo,
  notifyOrderCreated,
  persistOrder,
  validateCart,
  validateStoreExists,
} from "./internal";

type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

/**
 * Create B2C order from cart.
 * Supports both authenticated users and guest checkout.
 * Rejects invoice payment method (B2C only: in_store, card).
 */
export async function createB2COrder(data: {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: Exclude<PaymentMethod, "invoice">;
  customerInfo: GuestCustomerInfo;
}): Promise<CreateOrderResult> {
  try {
    const ordersEnabled = await getSiteConfig("orders_enabled");
    if (!ordersEnabled) {
      return { success: false, error: "Objednávky sú momentálne vypnuté" };
    }

    if (!(await isValidGuestInfo(data.customerInfo))) {
      return { success: false, error: "Vyplňte prosím všetky kontaktné údaje" };
    }

    const storeValidation = await validateStoreExists(data.storeId);
    if (!storeValidation.success) {
      return storeValidation;
    }

    const cartValidation = await validateCart();
    if (!cartValidation.success) {
      return cartValidation;
    }

    const orderItemsData = await buildOrderItems(
      cartValidation.cartItems,
      null
    );
    if (orderItemsData.length === 0) {
      return { success: false, error: "Žiadne platné produkty v košíku" };
    }

    const totalCents = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const user = await getUser();
    const { orderId, orderNumber } = await persistOrder({
      userId: user?.id ?? null,
      customerInfo: data.customerInfo,
      storeId: data.storeId,
      companyId: null,
      paymentMethod: data.paymentMethod,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      totalCents,
      orderItemsData,
    });

    await clearCartAfterOrder();

    // Handle post-order side effects
    if (user) {
      const { updateCurrentUserProfile } = await import(
        "@/features/user-profile/api/actions"
      );
      updateCurrentUserProfile({
        name: data.customerInfo.name,
        email: data.customerInfo.email,
        phone: data.customerInfo.phone,
      }).catch((err) => {
        console.error("Failed to update user profile:", err);
      });
    } else {
      setLastOrderIdAction(orderId).catch((err) => {
        console.error("Failed to set last order ID:", err);
      });
    }

    await notifyOrderCreated(orderId);

    return { success: true, orderId, orderNumber };
  } catch (error) {
    console.error("[SERVER] Create B2C ORDER failed:", error);
    return { success: false, error: "Nastala chyba pri vytváraní objednávky" };
  }
}
