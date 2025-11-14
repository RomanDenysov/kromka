import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { createShortId } from "@/lib/ids";
import type {
  OrderItemSchema,
  OrderPaymentSchema,
  OrderSchema,
  OrderStatusEventSchema,
  PaymentRefundSchema,
} from "@/validation/orders";
import {
  orderItems,
  orderPayments,
  orderStatusEvents,
  orders,
  paymentRefunds,
} from "../schema";

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = createShortId();
  return `ORD-${year}${month}${day}-${random}`;
}

export const MUTATIONS = {
  ADMIN: {
    CREATE_DRAFT_ORDER: async (
      userId: string,
      order: Partial<Omit<OrderSchema, "id" | "orderNumber" | "createdBy">> = {}
    ) => {
      let orderNumber = generateOrderNumber();
      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 10) {
        const existing = await db.query.orders.findFirst({
          where: (existingOrder, { eq: eqFn }) =>
            eqFn(existingOrder.orderNumber, orderNumber),
        });
        if (!existing) {
          break;
        }
        orderNumber = generateOrderNumber();
        // biome-ignore lint/nursery/noIncrementDecrement: TODO: Refactor this later
        attempts++;
      }

      const [newOrder] = await db
        .insert(orders)
        .values({
          orderNumber,
          createdBy: userId,
          ...order,
        })
        .returning();

      return newOrder;
    },

    UPDATE_ORDER: async (
      orderId: string,
      order: Partial<Omit<OrderSchema, "id" | "orderNumber">>
    ) => {
      const [updatedOrder] = await db
        .update(orders)
        .set(order)
        .where(eq(orders.id, orderId))
        .returning();

      return updatedOrder;
    },

    CREATE_ORDER_STATUS_EVENT: async (
      orderId: string,
      status: OrderStatusEventSchema["status"],
      note: string | null = null,
      userId: string | null = null
    ) => {
      const [newEvent] = await db
        .insert(orderStatusEvents)
        .values({
          orderId,
          status,
          note,
          createdBy: userId,
        })
        .returning();

      // Update order status
      await db
        .update(orders)
        .set({ currentStatus: status })
        .where(eq(orders.id, orderId));

      return newEvent;
    },

    ADD_ORDER_ITEM: async (
      orderId: string,
      item: Omit<OrderItemSchema, "orderId">
    ) => {
      const [newItem] = await db
        .insert(orderItems)
        .values({
          orderId,
          ...item,
        })
        .returning();

      return newItem;
    },

    UPDATE_ORDER_ITEM: async (
      orderId: string,
      productId: string,
      item: Partial<Omit<OrderItemSchema, "orderId" | "productId">>
    ) => {
      const [updatedItem] = await db
        .update(orderItems)
        .set(item)
        .where(
          and(
            eq(orderItems.orderId, orderId),
            eq(orderItems.productId, productId)
          )
        )
        .returning();

      return updatedItem;
    },

    REMOVE_ORDER_ITEM: async (orderId: string, productId: string) => {
      await db
        .delete(orderItems)
        .where(
          and(
            eq(orderItems.orderId, orderId),
            eq(orderItems.productId, productId)
          )
        );

      return { success: true };
    },

    CREATE_ORDER_PAYMENT: async (
      orderId: string,
      payment: Omit<
        OrderPaymentSchema,
        "id" | "orderId" | "createdAt" | "updatedAt"
      >
    ) => {
      const [newPayment] = await db
        .insert(orderPayments)
        .values({
          orderId,
          ...payment,
        })
        .returning();

      return newPayment;
    },

    UPDATE_PAYMENT_STATUS: async (
      paymentId: string,
      status: OrderPaymentSchema["status"],
      additionalFields?: Partial<
        Omit<OrderPaymentSchema, "id" | "orderId" | "createdAt" | "updatedAt">
      >
    ) => {
      const [updatedPayment] = await db
        .update(orderPayments)
        .set({
          status,
          ...additionalFields,
        })
        .where(eq(orderPayments.id, paymentId))
        .returning();

      return updatedPayment;
    },

    CREATE_PAYMENT_REFUND: async (
      paymentId: string,
      refund: Omit<PaymentRefundSchema, "id" | "paymentId" | "createdAt">
    ) => {
      const [newRefund] = await db
        .insert(paymentRefunds)
        .values({
          paymentId,
          ...refund,
        })
        .returning();

      return newRefund;
    },
  },
};
