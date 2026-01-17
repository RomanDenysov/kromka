"use server";

import { eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { orderStatusEvents, orders } from "@/db/schema";
import type { OrderStatus, PaymentStatus } from "@/db/types";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";
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
  await requireAuth();
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
    await Promise.allSettled(
      chunk.map((order) => sendEmailBasedOnOrderStatus(order, orderStatus))
    );

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
    console.error("[SERVER] Bulk update orders failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri aktualizácii objednávok",
    };
  }
}
