"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { carts, orderItems, orderStatusEvents, orders } from "@/db/schema";
import type { OrderStatus, PaymentMethod } from "@/db/types";
import { getAuth } from "../auth/session";
import { clearCartIdCookie, getCartIdFromCookie } from "../cart/cookies";
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
  pickupDate: Date;
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

    const cartId = await getCartIdFromCookie();
    if (!cartId) {
      return { success: false, error: "Košík je prázdny" };
    }

    // 1. Get cart
    const cart = await db.query.carts.findFirst({
      where: eq(carts.id, cartId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Košík je prázdny" };
    }

    // 2. Validation of items
    const validItems = cart.items.filter((item) => item.product);
    if (validItems.length === 0) {
      return { success: false, error: "Žiadne platné produkty v košíku" };
    }

    // 3. Preparation of items with prices
    const orderItemsData = validItems.map((item) => {
      // biome-ignore lint/style/noNonNullAssertion: TODO: fix this in a future
      const product = item.product!;

      return {
        productId: item.productId,
        productSnapshot: {
          name: product.name,
          price: product.priceCents,
        },
        price: product.priceCents,
        quantity: item.quantity,
      };
    });

    // 4. Розрахунок total
    const totalCents = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 5. Generation of order number
    const orderNumber = createPrefixedNumericId("OBJ");

    // 6. Creation of order
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
        pickupDate: format(data.pickupDate, "yyyy-MM-dd"),
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

    // 9. Deletion of cart and clear cookie
    await db.delete(carts).where(eq(carts.id, cart.id));
    await clearCartIdCookie();

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
    console.error("Create order failed:", error);
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

  const [updatedOrder] = await db
    .update(orders)
    .set({ orderStatus: status })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(orderStatusEvents).values({
    orderId,
    status,
    createdBy: user.id,
    note: note ?? null,
  });

  await sendEmailBasedOnOrderStatus(updatedOrder.id, status);

  return updatedOrder;
}
