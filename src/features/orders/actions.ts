"use server";

import { eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import {
  orderItems,
  orderStatusEvents,
  orders,
  products,
  stores,
} from "@/db/schema";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/db/types";
import { clearCart, getCart } from "@/features/cart/cookies";
import { requireAdmin, requireAuth } from "@/lib/auth/guards";
import { getUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { createPrefixedNumericId } from "@/lib/ids";
import { getSiteConfig } from "@/lib/site-config/queries";
import { setLastOrderIdAction } from "../checkout/actions";
import { getOrderById, getOrdersByIds, type Order } from "./queries";

type CreateOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

export type GuestCustomerInfo = {
  name: string;
  email: string;
  phone: string;
};

function isValidGuestInfo(info: GuestCustomerInfo): boolean {
  return Boolean(info.name.trim() && info.email.trim() && info.phone.trim());
}

/**
 * Create order from cart (B2C checkout)
 * Supports both authenticated users and guest checkout
 */
export async function createOrderFromCart(data: {
  storeId: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  /** Customer info - required for all orders (guests and authenticated users) */
  customerInfo: GuestCustomerInfo;
}): Promise<CreateOrderResult> {
  try {
    // Check if orders are enabled
    const ordersEnabled = await getSiteConfig("orders_enabled");
    if (!ordersEnabled) {
      return {
        success: false,
        error: "Objednávky sú momentálne vypnuté",
      };
    }

    const user = await getUser();
    const isGuest = !user;

    // Validate customer info
    if (!isValidGuestInfo(data.customerInfo)) {
      return {
        success: false,
        error: "Vyplňte prosím všetky kontaktné údaje",
      };
    }

    // 1. Validate store exists
    const storeExists = await db.query.stores.findFirst({
      where: eq(stores.id, data.storeId),
      columns: { id: true },
    });

    if (!storeExists) {
      return { success: false, error: "Vybraná predajňa neexistuje" };
    }

    // 2. Get cart from cookie
    const cartItems = await getCart();
    if (cartItems.length === 0) {
      return { success: false, error: "Košík je prázdny" };
    }
    // 3. Get product data from DB
    const productIds = cartItems.map((item) => item.productId);
    const productData = await db.query.products.findMany({
      where: inArray(products.id, productIds),
    });
    // 4. Validation - match cart items with products
    const orderItemsData = cartItems
      .map((item) => {
        const product = productData.find((p) => p.id === item.productId);
        if (!product) {
          return null;
        }

        return {
          productId: item.productId,
          productSnapshot: {
            name: product.name,
            price: product.priceCents,
          },
          price: product.priceCents,
          quantity: item.qty,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (orderItemsData.length === 0) {
      return { success: false, error: "Žiadne platné produkty v košíku" };
    }

    // 5. Calculate total
    const totalCents = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 6. Generate order number
    const orderNumber = createPrefixedNumericId("OBJ");

    // 7. Create order (always store customerInfo for last-order prefill)
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        createdBy: user?.id ?? null,
        customerInfo: data.customerInfo,
        storeId: data.storeId,
        orderStatus: "new",
        paymentStatus: "pending",
        paymentMethod: data.paymentMethod,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        totalCents,
      })
      .returning();

    // 8. Batch insert items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }))
    );

    // 9. Status event
    await db.insert(orderStatusEvents).values({
      orderId: order.id,
      status: "new",
      createdBy: user?.id ?? null,
    });

    // 10. Clear cart cookie
    await clearCart();

    // 11. Update last order ID (for guests: cookie; for auth users: query by userId)
    if (isGuest) {
      setLastOrderIdAction(order.id).catch((error) => {
        console.error("Failed to set last order ID:", error);
      });
    }

    // 12. For authenticated users: update profile name/phone as side-effect
    if (user) {
      const { updateCurrentUserProfile } = await import(
        "@/lib/actions/user-profile"
      );
      updateCurrentUserProfile({
        name: data.customerInfo.name,
        email: data.customerInfo.email,
        phone: data.customerInfo.phone,
      }).catch((error) => {
        // Non-blocking: profile update failure shouldn't prevent order creation
        console.error("Failed to update user profile:", error);
      });
    }

    // 13. Fetch full order with relations
    const fullOrder = await getOrderById(order.id);
    if (!fullOrder) {
      throw new Error("Order not found after creation");
    }

    // 14. Send email to staff and customer
    await sendEmail.newOrder({ order: fullOrder });
    await sendEmail.receipt({ order: fullOrder });

    return {
      success: true,
      orderId: order.id,
      orderNumber,
    };
  } catch (error) {
    console.error("[SERVER] Create ORDER failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri vytváraní objednávky",
    };
  }
}
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
