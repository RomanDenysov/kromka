"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { PaymentMethod } from "@/db/types";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { requireB2bMember } from "@/lib/auth/guards";
import { log } from "@/lib/logger";
import { guard, runPipeline, unwrap } from "@/lib/pipeline";
import {
  buildOrderItems,
  clearB2bCartAfterOrder,
  notifyOrderCreated,
  persistOrder,
  validateB2bCart,
  validatePickupDate,
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
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
}): Promise<CreateOrderResult> {
  try {
    const result = await runPipeline(async () => {
      const ordersEnabled = await getSiteConfig("orders_enabled");
      guard(ordersEnabled, "Objednávky sú momentálne vypnuté", "ORDERS_DISABLED");

      const b2bContext = await requireB2bMember();
      unwrap(await validatePickupDate(data.pickupDate));

      const cartItems = unwrap(await validateB2bCart());
      const orderItemsData = await buildOrderItems(
        cartItems,
        b2bContext.priceTierId
      );
      guard(
        orderItemsData.length > 0,
        "Žiadne platné produkty v košíku",
        "INVALID_PRODUCTS"
      );

      const totalCents = orderItemsData.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const customerInfo = {
        name:
          b2bContext.organization.billingName ?? b2bContext.organization.name,
        email: b2bContext.organization.billingEmail ?? b2bContext.user.email,
        phone: b2bContext.user.phone ?? "",
      };

      const { orderId, orderNumber } = await persistOrder({
        userId: b2bContext.user.id,
        customerInfo,
        storeId: null,
        companyId: b2bContext.organization.id,
        paymentMethod: data.paymentMethod,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        totalCents,
        orderItemsData,
        deliveryAddress: b2bContext.organization.billingAddress,
      });

      return { orderId, orderNumber };
    });

    if (!result.ok) {
      return { success: false, error: result.error };
    }

    const { orderId, orderNumber } = result.data;

    // Clear B2B cart only after confirmed pipeline success
    await clearB2bCartAfterOrder();

    // Fire-and-forget: don't block order success on email
    notifyOrderCreated(orderId).catch((err) => {
      log.email.error({ err, orderId }, "Failed to send order notification");
    });

    return { success: true, orderId, orderNumber };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    log.orders.error({ err: error }, "Create B2B order failed");
    return { success: false, error: "Nastala chyba pri vytváraní objednávky" };
  }
}
