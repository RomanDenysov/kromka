"use server";

import { eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { carts, orderItems, orderStatusEvents, orders } from "@/db/schema";
import type { OrderStatus, PaymentMethod } from "@/db/types";
import { getAuth } from "../auth/session";

const ORDER_NUMBER_PADDING = 5;
const ORDER_NUMBER_BASE = 10;

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20250115-00001)
 */
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `ORD-${dateStr}-`;

  // Find the highest order number for today
  const lastOrder = await db.query.orders.findFirst({
    where: (order, { like }) => like(order.orderNumber, `${prefix}%`),
    columns: { orderNumber: true },
    orderBy: (order, { desc }) => [desc(order.orderNumber)],
  });

  if (lastOrder?.orderNumber) {
    const lastNum = Number.parseInt(
      lastOrder.orderNumber.slice(-ORDER_NUMBER_PADDING),
      ORDER_NUMBER_BASE
    );
    const nextNum = (lastNum + 1)
      .toString()
      .padStart(ORDER_NUMBER_PADDING, "0");
    return `${prefix}${nextNum}`;
  }

  return `${prefix}00001`;
}

/**
 * Recalculate order total from items
 */
async function recalculateOrderTotal(orderId: string): Promise<void> {
  const result = await db
    .select({
      total: sum(sql`${orderItems.price} * ${orderItems.quantity}`),
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const totalCents = Number(result[0]?.total) || 0;

  await db.update(orders).set({ totalCents }).where(eq(orders.id, orderId));
}

/**
 * Create order from cart (B2C checkout)
 */
export async function createOrderFromCart(data: {
  storeId: string;
  pickupDate: Date;
  pickupTime: string;
  paymentMethod: PaymentMethod;
}) {
  const { user, session } = await getAuth();
  if (!(user && session)) {
    throw new Error("Unauthorized");
  }

  const companyId = session.session?.activeOrganizationId ?? null;

  // Get cart
  const cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn }) => {
      if (companyId) {
        return andFn(
          eqFn(cartTable.userId, user.id),
          eqFn(cartTable.companyId, companyId)
        );
      }
      return andFn(
        eqFn(cartTable.userId, user.id),
        sql`${cartTable.companyId} IS NULL`
      );
    },
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      createdBy: user.id,
      storeId: data.storeId,
      companyId,
      orderStatus: "new",
      paymentStatus: "pending",
      paymentMethod: data.paymentMethod,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime as `${number}:${number}:${number}`,
      totalCents: 0, // Will be recalculated
    })
    .returning();

  // Copy items from cart to order
  for (const item of cart.items) {
    if (!item.product) {
      continue;
    }
    const product = item.product;
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productSnapshot: {
        name: product.name,
        price: product.priceCents,
      },
      price: product.priceCents, // B2C uses default price
      quantity: item.quantity,
    });
  }

  // Recalculate total
  await recalculateOrderTotal(order.id);

  // Create initial status event
  await db.insert(orderStatusEvents).values({
    orderId: order.id,
    status: "new",
    createdBy: user.id,
  });

  // Delete cart
  await db.delete(carts).where(eq(carts.id, cart.id));

  return order.id;
}

/**
 * Create B2B order from cart (invoice payment method)
 */
export async function createB2BOrderFromCart(data: {
  storeId: string;
  pickupDate: Date;
  pickupTime: string;
}) {
  const { user, session } = await getAuth();
  if (!(user && session?.session?.activeOrganizationId)) {
    throw new Error("Unauthorized or not a B2B user");
  }

  const companyId = session.session.activeOrganizationId;

  // Get cart with companyId
  const cart = await db.query.carts.findFirst({
    where: (cartTable, { eq: eqFn, and: andFn }) =>
      andFn(
        eqFn(cartTable.userId, user.id),
        eqFn(cartTable.companyId, companyId)
      ),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Calculate prices using B2B pricing
  const { getProductPrice } = await import("./cart");

  // Create order with invoice payment method
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      createdBy: user.id,
      storeId: data.storeId,
      companyId,
      orderStatus: "new",
      paymentStatus: "pending",
      paymentMethod: "invoice",
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime as `${number}:${number}:${number}`,
      totalCents: 0, // Will be recalculated
    })
    .returning();

  // Copy items from cart to order with B2B pricing
  for (const item of cart.items) {
    if (!item.product) {
      continue;
    }
    const product = item.product;
    const priceCents = await getProductPrice(
      item.productId,
      companyId,
      item.quantity
    );

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: item.productId,
      productSnapshot: {
        name: product.name,
        price: priceCents,
      },
      price: priceCents,
      quantity: item.quantity,
    });
  }

  // Recalculate total
  await recalculateOrderTotal(order.id);

  // Create initial status event
  await db.insert(orderStatusEvents).values({
    orderId: order.id,
    status: "new",
    createdBy: user.id,
  });

  // Delete cart
  await db.delete(carts).where(eq(carts.id, cart.id));

  return order.id;
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

  return updatedOrder;
}
