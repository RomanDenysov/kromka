"use server";

import { isBefore, isSameDay, startOfToday } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { db } from "@/db";
import { log } from "@/lib/logger";
import { orders } from "@/db/schema";
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
    if ((data.paymentMethod as string) === "invoice") {
      return { success: false, error: "Platba na faktúru nie je dostupná pre B2C objednávky" };
    }

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

    // Server-side pickup date validation
    const pickupDate = new Date(data.pickupDate);
    const today = startOfToday();
    if (
      Number.isNaN(pickupDate.getTime()) ||
      isBefore(pickupDate, today) ||
      isSameDay(pickupDate, today)
    ) {
      return {
        success: false,
        error: "Neplatný dátum vyzdvihnutia",
      };
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

    // Duplicate order protection (authenticated users only)
    if (user) {
      const recentDuplicate = await db.query.orders.findFirst({
        where: and(
          eq(orders.createdBy, user.id),
          eq(orders.totalCents, totalCents),
          eq(orders.pickupDate, data.pickupDate),
          gte(orders.createdAt, new Date(Date.now() - 5 * 60 * 1000))
        ),
      });
      if (recentDuplicate) {
        return { success: true, orderId: recentDuplicate.id, orderNumber: recentDuplicate.orderNumber };
      }
    }

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
        log.orders.error({ err }, "Failed to update user profile after order");
      });
    } else {
      setLastOrderIdAction(orderId).catch((err) => {
        log.orders.error({ err }, "Failed to set last order ID for guest");
      });
    }

    // Fire-and-forget: don't block order success on email
    notifyOrderCreated(orderId).catch((err) => {
      log.email.error({ err, orderId }, "Failed to send order notification");
    });

    return { success: true, orderId, orderNumber };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    log.orders.error({ err: error }, "Create B2C order failed");
    return { success: false, error: "Nastala chyba pri vytváraní objednávky" };
  }
}
