"use server";

import { eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { orderItems, orderStatusEvents, orders, products } from "@/db/schema";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/db/types";
import { getAuth } from "../auth/session";
import { clearCart, getCart } from "../cart/cookies";
import { sendEmail } from "../email";
import { createPrefixedNumericId } from "../ids";
import { getOrderById } from "../queries/orders";

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
  /** Required for guest checkout when user is not authenticated */
  customerInfo?: GuestCustomerInfo;
}): Promise<CreateOrderResult> {
  try {
    const { user } = await getAuth();
    const isGuest = !user;

    // Require either authenticated user or guest customer info
    if (isGuest && !data.customerInfo) {
      return {
        success: false,
        error:
          "Pre objednávku je potrebné byť prihlásený alebo zadať kontaktné údaje",
      };
    }

    // Validate guest info if provided
    if (isGuest && data.customerInfo && !isValidGuestInfo(data.customerInfo)) {
      return {
        success: false,
        error: "Vyplňte prosím všetky kontaktné údaje",
      };
    }

    // 1. Get cart from cookie
    const cartItems = await getCart();
    if (cartItems.length === 0) {
      return { success: false, error: "Košík je prázdny" };
    }
    // 2. Get product data from DB
    const productIds = cartItems.map((item) => item.productId);
    const productData = await db.query.products.findMany({
      where: inArray(products.id, productIds),
    });
    // 3. Validation - match cart items with products
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

    // 4. Calculate total
    const totalCents = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 5. Generate order number
    const orderNumber = createPrefixedNumericId("OBJ");

    // 6. Create order
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        createdBy: user?.id ?? null,
        customerInfo: data.customerInfo ?? null,
        storeId: data.storeId,
        orderStatus: "new",
        paymentStatus: "pending",
        paymentMethod: data.paymentMethod,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        totalCents,
      })
      .returning();

    // 7. Batch insert items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }))
    );

    // 8. Status event
    await db.insert(orderStatusEvents).values({
      orderId: order.id,
      status: "new",
      createdBy: user?.id ?? null,
    });

    // 9. Clear cart cookie
    await clearCart();

    // 10. Fetch full order with relations
    const fullOrder = await getOrderById(order.id);
    if (!fullOrder) {
      throw new Error("Order not found after creation");
    }

    // 11. Send email to staff and customer
    await sendEmail.newOrder({ order: fullOrder });
    await sendEmail.receipt({ order: fullOrder });

    return {
      success: true,
      orderId: order.id,
      orderNumber,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: TODO: replace with error logging later
    console.error("[SERVER] Create ORDER failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri vytváraní objednávky",
    };
  }
}
// "in_progress" | "ready_for_pickup" | "completed" | "cancelled" | "refunded";

async function sendEmailBasedOnOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const order = await getOrderById(orderId);
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
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
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
    createdBy: user.id,
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
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(orders)
    .set({ paymentStatus: status })
    .where(eq(orders.id, orderId));

  refresh();
}
