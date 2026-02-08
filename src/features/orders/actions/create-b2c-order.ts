"use server";

import { and, eq, gte } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isB2cPaymentMethod } from "@/db/types";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { getUser } from "@/lib/auth/session";
import { log } from "@/lib/logger";
import { guard, runPipeline, unwrap } from "@/lib/pipeline";
import { setLastOrderIdAction } from "../../checkout/api/actions";
import {
  buildOrderItems,
  clearCartAfterOrder,
  type GuestCustomerInfo,
  notifyOrderCreated,
  persistOrder,
  validateCart,
  validateGuestInfo,
  validatePickupDate,
  validateStoreExists,
} from "./internal";

/** Duplicate order detection window (5 minutes) */
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

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
  paymentMethod: string;
  customerInfo: GuestCustomerInfo;
}): Promise<CreateOrderResult> {
  try {
    const result = await runPipeline(async () => {
      guard(
        isB2cPaymentMethod(data.paymentMethod),
        "Neplatný spôsob platby",
        "INVALID_PAYMENT_METHOD"
      );

      const ordersEnabled = await getSiteConfig("orders_enabled");
      guard(ordersEnabled, "Objednávky sú momentálne vypnuté", "ORDERS_DISABLED");

      unwrap(await validateGuestInfo(data.customerInfo));
      unwrap(await validateStoreExists(data.storeId));
      unwrap(await validatePickupDate(data.pickupDate));

      const cartItems = unwrap(await validateCart());
      const orderItemsData = await buildOrderItems(cartItems, null);
      guard(orderItemsData.length > 0, "Žiadne platné produkty v košíku", "INVALID_PRODUCTS");

      const totalCents = orderItemsData.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const user = await getUser();

      // Duplicate order protection (authenticated users only)
      // Note: TOCTOU race possible on double-click; mitigated by short window + client-side disable
      if (user) {
        const recentDuplicate = await db.query.orders.findFirst({
          where: and(
            eq(orders.createdBy, user.id),
            eq(orders.totalCents, totalCents),
            eq(orders.pickupDate, data.pickupDate),
            gte(orders.createdAt, new Date(Date.now() - DUPLICATE_WINDOW_MS))
          ),
        });
        if (recentDuplicate) {
          log.orders.info(
            { orderId: recentDuplicate.id, userId: user.id },
            "Duplicate B2C order detected, returning existing"
          );
          return {
            orderId: recentDuplicate.id,
            orderNumber: recentDuplicate.orderNumber,
          };
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

      return { orderId, orderNumber, userId: user?.id ?? null };
    });

    if (!result.ok) {
      return { success: false, error: result.error };
    }

    const { orderId, orderNumber, userId } = result.data;

    // Clear cart only after confirmed pipeline success
    await clearCartAfterOrder();

    // Fire-and-forget side effects
    if (userId) {
      import("@/features/user-profile/api/actions")
        .then(({ updateCurrentUserProfile }) =>
          updateCurrentUserProfile({
            name: data.customerInfo.name,
            email: data.customerInfo.email,
            phone: data.customerInfo.phone,
          })
        )
        .catch((err) => {
          log.orders.error({ err }, "Failed to update user profile after order");
        });
    } else {
      setLastOrderIdAction(orderId).catch((err) => {
        log.orders.error({ err }, "Failed to set last order ID for guest");
      });
    }

    notifyOrderCreated(orderId).catch((err) => {
      log.email.error({ err, orderId }, "Failed to send order notification");
    });

    return { success: true, orderId, orderNumber };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    log.orders.error({ err: error }, "Create B2C order failed");
    return { success: false, error: "Nastala chyba pri vytváraní objednávky" };
  }
}
