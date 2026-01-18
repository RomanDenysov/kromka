"use server";

import type { PaymentMethod } from "@/db/types";
import { requireB2bMember } from "@/lib/auth/guards";
import { getSiteConfig } from "@/lib/site-config/queries";
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
 * Create B2B order from cart.
 * Requires B2B organization membership.
 * Allows invoice payment method.
 */
export async function createB2BOrder(data: {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  customerInfo: GuestCustomerInfo;
}): Promise<CreateOrderResult> {
  try {
    const ordersEnabled = await getSiteConfig("orders_enabled");
    if (!ordersEnabled) {
      return { success: false, error: "Objednávky sú momentálne vypnuté" };
    }

    if (!isValidGuestInfo(data.customerInfo)) {
      return { success: false, error: "Vyplňte prosím všetky kontaktné údaje" };
    }

    // Require B2B membership
    const b2bContext = await requireB2bMember();

    const storeValidation = await validateStoreExists(data.storeId);
    if (!storeValidation.success) {
      return storeValidation;
    }

    const cartValidation = await validateCart();
    if (!cartValidation.success) {
      return cartValidation;
    }

    // Build order items with tier pricing
    const orderItemsData = await buildOrderItems(
      cartValidation.cartItems,
      b2bContext.priceTierId
    );
    if (orderItemsData.length === 0) {
      return { success: false, error: "Žiadne platné produkty v košíku" };
    }

    const totalCents = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const { orderId, orderNumber } = await persistOrder({
      userId: b2bContext.user.id,
      customerInfo: data.customerInfo,
      storeId: data.storeId,
      companyId: b2bContext.organization.id,
      paymentMethod: data.paymentMethod,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      totalCents,
      orderItemsData,
    });

    await clearCartAfterOrder();

    // Update user profile as side effect
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

    await notifyOrderCreated(orderId);

    return { success: true, orderId, orderNumber };
  } catch (error) {
    console.error("[SERVER] Create B2B ORDER failed:", error);
    return { success: false, error: "Nastala chyba pri vytváraní objednávky" };
  }
}
