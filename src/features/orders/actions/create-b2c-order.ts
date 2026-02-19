"use server";

import { updateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { after } from "next/server";
import { isB2cPaymentMethod } from "@/db/types";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { getUser } from "@/lib/auth/session";
import { log } from "@/lib/logger";
import { guard, runPipeline, unwrap } from "@/lib/pipeline";
import { captureServerEvent } from "@/lib/posthog";
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
      guard(
        ordersEnabled,
        "Objednávky sú momentálne vypnuté",
        "ORDERS_DISABLED"
      );

      unwrap(await validateGuestInfo(data.customerInfo));
      unwrap(await validateStoreExists(data.storeId));
      unwrap(await validatePickupDate(data.pickupDate));

      const cartItems = unwrap(await validateCart());
      const orderItemsData = await buildOrderItems(cartItems, null);
      guard(
        orderItemsData.length > 0,
        "Žiadne platné produkty v košíku",
        "INVALID_PRODUCTS"
      );

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

      return {
        orderId,
        orderNumber,
        userId: user?.id ?? null,
        totalCents,
        itemCount: orderItemsData.length,
      };
    });

    if (!result.ok) {
      return { success: false, error: result.error };
    }

    const { orderId, orderNumber, userId, totalCents, itemCount } = result.data;

    updateTag("orders");

    // Clear cart only after confirmed pipeline success
    await clearCartAfterOrder();

    // Non-blocking side effects via after()
    after(async () => {
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
            log.orders.error(
              { err },
              "Failed to update user profile after order"
            );
          });
      } else {
        setLastOrderIdAction(orderId).catch((err) => {
          log.orders.error({ err }, "Failed to set last order ID for guest");
        });
      }
    });

    after(async () => {
      await notifyOrderCreated(orderId).catch((err) => {
        log.email.error({ err, orderId }, "Failed to send order notification");
      });
    });

    after(async () => {
      await captureServerEvent(userId ?? data.customerInfo.email, "order completed", {
        order_id: orderId,
        order_number: orderNumber,
        total: totalCents,
        item_count: itemCount,
        payment_method: data.paymentMethod,
        store_id: data.storeId,
        pickup_date: data.pickupDate,
        is_b2b: false,
      }).catch((err) => {
        log.orders.error(
          { err, orderId },
          "Failed to capture PostHog order event"
        );
      });
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
