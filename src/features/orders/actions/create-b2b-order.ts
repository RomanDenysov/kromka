"use server";

import { isBefore, isSameDay, startOfToday } from "date-fns";
import { and, eq, gte } from "drizzle-orm";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { db } from "@/db";
import { log } from "@/lib/logger";
import { orders } from "@/db/schema";
import type { PaymentMethod } from "@/db/types";
import { getSiteConfig } from "@/features/site-config/api/queries";
import { requireB2bMember } from "@/lib/auth/guards";
import {
  buildOrderItems,
  clearB2bCartAfterOrder,
  notifyOrderCreated,
  persistOrder,
  validateB2bCart,
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
    const ordersEnabled = await getSiteConfig("orders_enabled");
    if (!ordersEnabled) {
      return { success: false, error: "Objednávky sú momentálne vypnuté" };
    }

    const b2bContext = await requireB2bMember();

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

    const cartValidation = await validateB2bCart();
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

    // Duplicate order protection
    const recentDuplicate = await db.query.orders.findFirst({
      where: and(
        eq(orders.createdBy, b2bContext.user.id),
        eq(orders.companyId, b2bContext.organization.id),
        eq(orders.totalCents, totalCents),
        eq(orders.pickupDate, data.pickupDate),
        gte(orders.createdAt, new Date(Date.now() - 5 * 60 * 1000))
      ),
    });
    if (recentDuplicate) {
      return { success: true, orderId: recentDuplicate.id, orderNumber: recentDuplicate.orderNumber };
    }

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

    await clearB2bCartAfterOrder();

    // Fire-and-forget: don't block order success on email
    notifyOrderCreated(orderId).catch((err) => {
      log.email.error({ err, orderId }, "Failed to send order notification");
    });

    return { success: true, orderId, orderNumber };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    log.orders.error({ err: error }, "Create B2B order failed");
    return { success: false, error: "Nastala chyba pri vytváraní objednávky" };
  }
}
