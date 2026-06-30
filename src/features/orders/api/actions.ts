"use server";

import { parseISO } from "date-fns";
import { and, eq, inArray, ne } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orderStatusEvents, orders, stores } from "@/db/schema";
import type { OrderStatus, PaymentStatus } from "@/db/types";
import {
  ADMIN_MODIFIABLE_PICKUP_STATUSES,
  MODIFIABLE_ORDER_STATUSES,
  ORDER_STATUSES,
} from "@/db/types";
import { logActivity, logActivityBatch } from "@/features/activity-log/api/log";
import {
  filterTimeSlots,
  generateAllTimeSlots,
  isValidPickupDate,
} from "@/features/checkout/utils";
import { getOrderPickupRestrictions } from "@/features/orders/actions/internal";
import {
  cancelOrderSchema,
  updateOrderPickupSchema,
} from "@/features/orders/schema";
import { requireAdmin, requireAuth, requireStaff } from "@/lib/auth/guards";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { createId } from "@/lib/ids";
import { log } from "@/lib/logger";
import { getTimeRangeForDate } from "@/lib/stores/schedule";
import { getOrderById, getOrdersByIds, type Order } from "./queries";

/**
 * Shared validation for pickup store, date, and time.
 * Returns the validated store on success, or an ActionResult error.
 */
async function validatePickupDetails(
  storeId: string,
  pickupDate: string,
  pickupTime: string,
  restrictedDates: Set<string> | null = null
): Promise<
  | { valid: true; store: { id: string; name: string } }
  | { valid: false; result: ActionResult }
> {
  const store = await db.query.stores.findFirst({
    where: and(eq(stores.id, storeId), eq(stores.isActive, true)),
  });

  if (!store) {
    return {
      valid: false,
      result: { success: false, error: "Vybraná predajňa nebola nájdená" },
    };
  }

  const parsedDate = parseISO(pickupDate);
  if (!isValidPickupDate(parsedDate, store.openingHours, restrictedDates)) {
    return {
      valid: false,
      result: {
        success: false,
        error: "Zvolený dátum nie je dostupný pre túto predajňu",
      },
    };
  }

  const timeRange = getTimeRangeForDate(parsedDate, store.openingHours);
  if (!timeRange) {
    return {
      valid: false,
      result: { success: false, error: "Predajňa je v tento deň zatvorená" },
    };
  }

  const validSlots = filterTimeSlots(generateAllTimeSlots(), timeRange);
  if (!validSlots.includes(pickupTime)) {
    return {
      valid: false,
      result: { success: false, error: "Zvolený čas nie je dostupný" },
    };
  }

  return { valid: true, store };
}

/** Persist pickup changes, log event, and send notification email. */
async function applyPickupUpdate(
  orderId: string,
  orderNumber: string,
  storeId: string,
  pickupDate: string,
  pickupTime: string,
  orderStatus: OrderStatus,
  userId: string,
  note: string,
  oldPickup: {
    storeId: string | null;
    pickupDate: string | null;
    pickupTime: string | null;
  },
  changedBy: { name: string; email: string; isStaff: boolean }
) {
  const [oldStore] = await Promise.all([
    oldPickup.storeId
      ? db.query.stores.findFirst({
          where: eq(stores.id, oldPickup.storeId),
          columns: { name: true, slug: true },
        })
      : null,
    db
      .update(orders)
      .set({ storeId, pickupDate, pickupTime })
      .where(eq(orders.id, orderId)),
    db.insert(orderStatusEvents).values({
      orderId,
      status: orderStatus,
      createdBy: userId,
      note,
    }),
  ]);

  logActivity({
    action: "order.pickup_updated",
    entityType: "order",
    entityId: orderId,
    actor: {
      id: userId,
      type: changedBy.isStaff ? "staff" : "customer",
      label: changedBy.name,
    },
    summary: `Zmena vyzdvihnutia · #${orderNumber}`,
    metadata: { note, context: orderNumber },
  });

  const previousPickup = {
    storeName: oldStore?.name ?? null,
    storeSlug: oldStore?.slug ?? null,
    pickupDate: oldPickup.pickupDate,
    pickupTime: oldPickup.pickupTime,
  };

  after(async () => {
    try {
      const fullOrder = await getOrderById(orderId);
      if (!fullOrder) {
        log.email.warn(
          { orderId },
          "Cannot send pickup email - order not found"
        );
        return;
      }
      await sendEmail.orderPickupUpdated({
        order: fullOrder,
        previousPickup,
        changedBy,
      });
    } catch (err) {
      log.email.error({ err, orderId }, "Failed to send pickup update email");
    }
  });
}

async function sendEmailBasedOnOrderStatus(
  orderOrId: string | Order,
  status: OrderStatus
) {
  const order =
    typeof orderOrId === "string" ? await getOrderById(orderOrId) : orderOrId;

  if (!order) {
    throw new Error("Order not found");
  }

  switch (status) {
    case "in_progress":
      return sendEmail.orderConfirmation({ order });
    case "ready_for_pickup":
      return sendEmail.orderReady({ order });
    case "completed":
      return sendEmail.thankYou({ order });
    case "cancelled":
      return sendEmail.orderCancelled({ order });
    // "new" and "refunded" have no customer-facing email template yet.
    default:
      return undefined;
  }
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

  // Auto-update payment status based on order status. Invoice-method
  // orders are excluded: they settle via the B2B invoice flow, and
  // auto-marking them "paid" would hide them from invoice generation
  // (which collects paymentStatus = "pending" orders only).
  const updates: { orderStatus: OrderStatus; paymentStatus?: PaymentStatus } = {
    orderStatus: status,
  };

  if (currentOrder.paymentMethod !== "invoice") {
    if (status === "completed" && currentOrder.paymentStatus !== "paid") {
      updates.paymentStatus = "paid";
    }

    if (status === "refunded" && currentOrder.paymentStatus !== "refunded") {
      updates.paymentStatus = "refunded";
    }
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

  logActivity({
    action: "order.status_changed",
    entityType: "order",
    entityId: orderId,
    actor: { id: admin.id, type: "staff", label: admin.name },
    summary: `${ORDER_STATUS_LABELS[status]} · #${currentOrder.orderNumber}`,
    metadata: {
      from: currentOrder.orderStatus,
      to: status,
      note: note ?? null,
      context: currentOrder.orderNumber,
    },
  });

  // Send the status email out-of-band: a mail failure must not fail the
  // status change (which is already persisted) nor throw to the client.
  after(async () => {
    try {
      await sendEmailBasedOnOrderStatus(updatedOrder.id, status);
    } catch (err) {
      log.email.error(
        { err, orderId, status },
        "Failed to send order status email"
      );
    }
  });

  // Invalidate cached dashboard metrics and reports (tagged "orders").
  updateTag("orders");
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

  updateTag("orders");
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
  admin: { id: string; name: string }
) {
  // Create status events for each order
  await db.insert(orderStatusEvents).values(
    orderIds.map((orderId) => ({
      orderId,
      status: orderStatus,
      createdBy: admin.id,
      note: `Hromadná zmena stavu (${orderIds.length} objednávok)`,
    }))
  );

  // Fetch all orders in one go for email sending
  const allOrders = await getOrdersByIds(orderIds);

  // Log one activity entry per order, sharing a batchId so the feed collapses
  // them into a single "N objednávok" row instead of flooding it.
  const batchId = createId();
  logActivityBatch(
    allOrders.map((order) => ({
      action: "order.status_changed" as const,
      entityType: "order" as const,
      entityId: order.id,
      actor: { id: admin.id, type: "staff" as const, label: admin.name },
      summary: `${ORDER_STATUS_LABELS[orderStatus]} · #${order.orderNumber}`,
      metadata: { to: orderStatus, batchId, context: order.orderNumber },
    }))
  );

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
    const updates: {
      orderStatus?: OrderStatus;
      paymentStatus?: PaymentStatus;
    } = {};
    if (orderStatus) {
      updates.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    await db.update(orders).set(updates).where(inArray(orders.id, orderIds));

    // Auto-sync payment status for completed/refunded when not set
    // explicitly. Invoice-method orders are excluded: they settle via
    // the B2B invoice flow, and auto-marking them "paid" would hide
    // them from invoice generation.
    if (orderStatus && !paymentStatus) {
      const autoPaymentStatusMap: Partial<Record<OrderStatus, PaymentStatus>> =
        { completed: "paid", refunded: "refunded" };
      const autoPaymentStatus = autoPaymentStatusMap[orderStatus];
      if (autoPaymentStatus) {
        await db
          .update(orders)
          .set({ paymentStatus: autoPaymentStatus })
          .where(
            and(
              inArray(orders.id, orderIds),
              ne(orders.paymentMethod, "invoice")
            )
          );
      }
    }

    if (orderStatus) {
      await handleBulkStatusNotifications(orderIds, orderStatus, admin);
    }

    updateTag("orders");
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

    logActivity({
      action: "order.cancelled",
      entityType: "order",
      entityId: orderId,
      actor: { id: user.id, type: "customer", label: user.name },
      summary: `Objednávka zrušená · #${order.orderNumber}`,
      metadata: {
        from: order.orderStatus,
        to: "cancelled",
        note: reason || "Zrušené zákazníkom",
        context: order.orderNumber,
      },
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

    updateTag("orders");
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

    // Category pickup-date restrictions apply to customer reschedules;
    // staff overrides (adminUpdateOrderPickupAction) skip them.
    const restrictedDates = await getOrderPickupRestrictions(orderId);
    const validation = await validatePickupDetails(
      storeId,
      pickupDate,
      pickupTime,
      restrictedDates
    );
    if (!validation.valid) {
      return validation.result;
    }

    await applyPickupUpdate(
      orderId,
      order.orderNumber,
      storeId,
      pickupDate,
      pickupTime,
      order.orderStatus,
      user.id,
      `Zákazník zmenil vyzdvihnutie: ${validation.store.name}, ${pickupDate} ${pickupTime}`,
      {
        storeId: order.storeId,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
      },
      { name: user.name, email: user.email, isStaff: false }
    );

    log.orders.info(
      { orderId, userId: user.id, storeId, pickupDate, pickupTime },
      "Order pickup updated by user"
    );

    refresh();
    return { success: true };
  } catch (error) {
    log.orders.error({ err: error, orderId }, "Update order pickup failed");
    return { success: false, error: "Nastala chyba pri úprave objednávky" };
  }
}

/**
 * Admin/manager action to change order pickup details (store, date, time).
 * Unlike the user-facing version, this skips ownership checks and allows
 * modification of "ready_for_pickup" orders too.
 */
export async function adminUpdateOrderPickupAction(
  input: z.infer<typeof updateOrderPickupSchema>
): Promise<ActionResult> {
  const staff = await requireStaff();

  const parsed = updateOrderPickupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }

  const { orderId, storeId, pickupDate, pickupTime } = parsed.data;

  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return { success: false, error: "Objednávka nebola nájdená" };
    }

    if (!ADMIN_MODIFIABLE_PICKUP_STATUSES.includes(order.orderStatus)) {
      return {
        success: false,
        error: "Túto objednávku už nie je možné upraviť",
      };
    }

    const validation = await validatePickupDetails(
      storeId,
      pickupDate,
      pickupTime
    );
    if (!validation.valid) {
      return validation.result;
    }

    await applyPickupUpdate(
      orderId,
      order.orderNumber,
      storeId,
      pickupDate,
      pickupTime,
      order.orderStatus,
      staff.id,
      `Zmena vyzdvihnutia (admin): ${validation.store.name}, ${pickupDate} ${pickupTime}`,
      {
        storeId: order.storeId,
        pickupDate: order.pickupDate,
        pickupTime: order.pickupTime,
      },
      { name: staff.name, email: staff.email, isStaff: true }
    );

    log.orders.info(
      { orderId, userId: staff.id, storeId, pickupDate, pickupTime },
      "Order pickup updated by admin"
    );

    refresh();
    return { success: true };
  } catch (error) {
    log.orders.error(
      {
        err: error,
        orderId,
        userId: staff.id,
        storeId,
        pickupDate,
        pickupTime,
      },
      "Admin update order pickup failed"
    );
    return { success: false, error: "Nastala chyba pri úprave objednávky" };
  }
}
