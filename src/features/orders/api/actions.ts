"use server";

import { parseISO } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orderStatusEvents, orders, stores } from "@/db/schema";
import type { OrderStatus, PaymentStatus } from "@/db/types";
import { MODIFIABLE_ORDER_STATUSES, ORDER_STATUSES } from "@/db/types";
import {
  filterTimeSlots,
  generateAllTimeSlots,
  getTimeRangeForDate,
  isValidPickupDate,
} from "@/features/checkout/utils";
import {
  cancelOrderSchema,
  updateOrderPickupSchema,
} from "@/features/orders/schema";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";
import { log } from "@/lib/logger";
import { getOrderById, getOrdersByIds, type Order } from "./queries";

// "in_progress" | "ready_for_pickup" | "completed" | "cancelled" | "refunded";

async function sendEmailBasedOnOrderStatus(
  orderOrId: string | Order,
  status: OrderStatus
) {
  const order =
    typeof orderOrId === "string" ? await getOrderById(orderOrId) : orderOrId;

  if (!order) {
    throw new Error("Order not found");
  }
  if (status === "in_progress") {
    return sendEmail.orderConfirmation({ order });
  }
  if (status === "ready_for_pickup") {
    return sendEmail.orderReady({ order });
  }
  if (status === "completed") {
    return sendEmail.thankYou({ order });
  }
  // if (status === "cancelled") {
  //   return sendEmail.outOfStock({ email: order.createdBy?.email ?? "", productName: order.items[0].product.name });
  // }
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatusAction({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: OrderStatus;
  note?: string;
}) {
  const admin = await requireAdmin();

  const statusSchema = z.enum(ORDER_STATUSES);
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    throw new Error("Invalid order status");
  }

  // Get current order to check payment status
  const currentOrder = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  // Auto-update payment status based on order status
  const updates: { orderStatus: OrderStatus; paymentStatus?: PaymentStatus } = {
    orderStatus: status,
  };

  // Set payment status to "paid" if order is completed and payment wasn't already set
  if (status === "completed" && currentOrder.paymentStatus !== "paid") {
    updates.paymentStatus = "paid";
  }

  // Set payment status to "refunded" if order is refunded and payment wasn't already refunded
  if (status === "refunded" && currentOrder.paymentStatus !== "refunded") {
    updates.paymentStatus = "refunded";
  }

  const [updatedOrder] = await db
    .update(orders)
    .set(updates)
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusEvents).values({
    orderId,
    status,
    createdBy: admin.id,
    note: note ?? null,
  });

  await sendEmailBasedOnOrderStatus(updatedOrder.id, status);

  refresh();

  return updatedOrder;
}

export async function updateOrderPaymentStatusAction({
  orderId,
  status,
}: {
  orderId: string;
  status: PaymentStatus;
}) {
  await requireAdmin();
  await db
    .update(orders)
    .set({ paymentStatus: status })
    .where(eq(orders.id, orderId));

  refresh();
}

type BulkUpdateResult =
  | { success: true; updatedCount: number }
  | { success: false; error: string };

/**
 * Helper to handle bulk status notifications and events
 */
async function handleBulkStatusNotifications(
  orderIds: string[],
  orderStatus: OrderStatus,
  userId: string
) {
  // Create status events for each order
  await db.insert(orderStatusEvents).values(
    orderIds.map((orderId) => ({
      orderId,
      status: orderStatus,
      createdBy: userId,
      note: `Hromadná zmena stavu (${orderIds.length} objednávok)`,
    }))
  );

  // Fetch all orders in one go for email sending
  const allOrders = await getOrdersByIds(orderIds);

  // Send emails in chunks to prevent SMTP issues
  const CHUNK_SIZE = 5;
  for (let i = 0; i < allOrders.length; i += CHUNK_SIZE) {
    const chunk = allOrders.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map((order) => sendEmailBasedOnOrderStatus(order, orderStatus))
    );
    for (const result of results) {
      if (result.status === "rejected") {
        log.email.error(
          { err: result.reason },
          "Failed to send order status email"
        );
      }
    }

    // Small delay between chunks if there are more
    if (i + CHUNK_SIZE < allOrders.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

/**
 * Helper to build update fields for bulk order updates
 */
function getBulkUpdateFields(
  orderStatus?: OrderStatus,
  paymentStatus?: PaymentStatus
) {
  const updates: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus } =
    {};

  if (orderStatus) {
    updates.orderStatus = orderStatus;
    // Auto-update payment status based on order status if not explicitly provided
    if (!paymentStatus) {
      if (orderStatus === "completed") {
        updates.paymentStatus = "paid";
      } else if (orderStatus === "refunded") {
        updates.paymentStatus = "refunded";
      }
    }
  }

  if (paymentStatus) {
    updates.paymentStatus = paymentStatus;
  }

  return updates;
}

/**
 * Bulk update order status and/or payment status for multiple orders (admin)
 * Sends email notifications for order status changes
 */
export async function bulkUpdateOrdersAction(data: {
  orderIds: string[];
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}): Promise<BulkUpdateResult> {
  const admin = await requireAdmin();

  const { orderIds, orderStatus, paymentStatus } = data;
  if (orderIds.length === 0) {
    return { success: false, error: "Neboli vybrané žiadne objednávky" };
  }
  if (!(orderStatus || paymentStatus)) {
    return { success: false, error: "Vyberte aspoň jeden stav na zmenu" };
  }

  try {
    const updates = getBulkUpdateFields(orderStatus, paymentStatus);

    await db.update(orders).set(updates).where(inArray(orders.id, orderIds));

    if (orderStatus) {
      await handleBulkStatusNotifications(orderIds, orderStatus, admin.id);
    }

    refresh();
    return { success: true, updatedCount: orderIds.length };
  } catch (error) {
    log.orders.error({ err: error }, "Bulk update orders failed");
    return {
      success: false,
      error: "Nastala chyba pri aktualizácii objednávok",
    };
  }
}

// ---------------------------------------------------------------------------
// User-facing actions
// ---------------------------------------------------------------------------

type ActionResult = { success: true } | { success: false; error: string };

export async function cancelOrderAction(
  input: z.infer<typeof cancelOrderSchema>
): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = cancelOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }

  const { orderId, reason } = parsed.data;

  try {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.createdBy, user.id)),
    });

    if (!order) {
      return { success: false, error: "Objednávka nebola nájdená" };
    }

    if (!MODIFIABLE_ORDER_STATUSES.includes(order.orderStatus)) {
      return {
        success: false,
        error: "Túto objednávku už nie je možné zrušiť",
      };
    }

    await db
      .update(orders)
      .set({ orderStatus: "cancelled" })
      .where(eq(orders.id, orderId));

    await db.insert(orderStatusEvents).values({
      orderId,
      status: "cancelled",
      createdBy: user.id,
      note: reason || "Zrušené zákazníkom",
    });

    log.orders.info({ orderId, userId: user.id }, "Order cancelled by user");

    after(async () => {
      try {
        const fullOrder = await getOrderById(orderId);
        if (fullOrder) {
          await sendEmail.orderCancelled({ order: fullOrder, reason });
        }
      } catch (err) {
        log.email.error({ err, orderId }, "Failed to send cancellation email");
      }
    });

    refresh();
    return { success: true };
  } catch (error) {
    log.orders.error({ err: error, orderId }, "Cancel order failed");
    return { success: false, error: "Nastala chyba pri rušení objednávky" };
  }
}

export async function updateOrderPickupAction(
  input: z.infer<typeof updateOrderPickupSchema>
): Promise<ActionResult> {
  const user = await requireAuth();

  const parsed = updateOrderPickupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }

  const { orderId, storeId, pickupDate, pickupTime } = parsed.data;

  try {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.createdBy, user.id)),
    });

    if (!order) {
      return { success: false, error: "Objednávka nebola nájdená" };
    }

    if (!MODIFIABLE_ORDER_STATUSES.includes(order.orderStatus)) {
      return {
        success: false,
        error: "Túto objednávku už nie je možné upraviť",
      };
    }

    // Validate store exists and is active
    const store = await db.query.stores.findFirst({
      where: and(eq(stores.id, storeId), eq(stores.isActive, true)),
    });

    if (!store) {
      return { success: false, error: "Vybraná predajňa nebola nájdená" };
    }

    // Validate pickup date
    const parsedDate = parseISO(pickupDate);
    if (!isValidPickupDate(parsedDate, store.openingHours, null)) {
      return {
        success: false,
        error: "Zvolený dátum nie je dostupný pre túto predajňu",
      };
    }

    // Validate pickup time
    const timeRange = getTimeRangeForDate(parsedDate, store.openingHours);
    if (!timeRange) {
      return {
        success: false,
        error: "Predajňa je v tento deň zatvorená",
      };
    }

    const validSlots = filterTimeSlots(generateAllTimeSlots(), timeRange);
    if (!validSlots.includes(pickupTime)) {
      return {
        success: false,
        error: "Zvolený čas nie je dostupný",
      };
    }

    await db
      .update(orders)
      .set({ storeId, pickupDate, pickupTime })
      .where(eq(orders.id, orderId));

    await db.insert(orderStatusEvents).values({
      orderId,
      status: order.orderStatus,
      createdBy: user.id,
      note: `Zákazník zmenil vyzdvihnutie: ${store.name}, ${pickupDate} ${pickupTime}`,
    });

    log.orders.info(
      { orderId, userId: user.id, storeId, pickupDate, pickupTime },
      "Order pickup updated by user"
    );

    after(async () => {
      try {
        const fullOrder = await getOrderById(orderId);
        if (fullOrder) {
          await sendEmail.orderPickupUpdated({ order: fullOrder });
        }
      } catch (err) {
        log.email.error({ err, orderId }, "Failed to send pickup update email");
      }
    });

    refresh();
    return { success: true };
  } catch (error) {
    log.orders.error({ err: error, orderId }, "Update order pickup failed");
    return { success: false, error: "Nastala chyba pri úprave objednávky" };
  }
}
