import "server-only";

import { and, eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orderStatusEvents, orders, products } from "@/db/schema";

type InsertOrder = typeof orders.$inferInsert;
type OrderStatus = InsertOrder["orderStatus"];

/**
 * Recalculates and updates the order total from its items
 */
async function recalculateOrderTotal(orderId: string) {
  const result = await db
    .select({
      total: sum(sql`${orderItems.price} * ${orderItems.quantity}`),
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const totalCents = Number(result[0]?.total) || 0;

  await db.update(orders).set({ totalCents }).where(eq(orders.id, orderId));
}

export const MUTATIONS = {
  ADMIN: {
    UPDATE_ORDER_STATUS: async (
      orderId: string,
      status: OrderStatus,
      userId: string,
      note?: string
    ) => {
      // Update the order status
      const [updatedOrder] = await db
        .update(orders)
        .set({ orderStatus: status })
        .where(eq(orders.id, orderId))
        .returning();

      // Create a status event
      await db.insert(orderStatusEvents).values({
        orderId,
        status,
        createdBy: userId,
        note: note ?? null,
      });

      return updatedOrder;
    },
  },
  PUBLIC: {
    ADD_TO_CART: async (
      productId: string,
      userId: string,
      quantity: number
    ) => {
      let orderId: string | undefined;

      orderId = (
        await db.query.orders.findFirst({
          where: and(
            eq(orders.orderStatus, "cart"),
            eq(orders.createdBy, userId)
          ),
          columns: {
            id: true,
          },
        })
      )?.id;
      if (!orderId) {
        orderId = (
          await db
            .insert(orders)
            .values({
              orderStatus: "cart",
              createdBy: userId,
            })
            .returning({ id: orders.id })
        )[0].id;
      }

      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      });
      if (!product) {
        throw new Error("Product not found");
      }
      await db
        .insert(orderItems)
        .values({
          orderId,
          productId,
          productSnapshot: {
            name: product.name,
            price: product.priceCents,
          },
          price: product.priceCents,
          quantity,
        })
        .onConflictDoUpdate({
          target: [orderItems.orderId, orderItems.productId],
          set: {
            quantity: sql`${orderItems.quantity} + ${quantity}`,
            price: sql`excluded.price`,
          },
        });

      await recalculateOrderTotal(orderId);
    },
    REMOVE_FROM_CART: async (productId: string, userId: string) => {
      const order = await db.query.orders.findFirst({
        where: and(
          eq(orders.orderStatus, "cart"),
          eq(orders.createdBy, userId)
        ),
        columns: {
          id: true,
        },
      });

      if (!order) {
        return;
      }

      await db
        .delete(orderItems)
        .where(
          and(
            eq(orderItems.orderId, order.id),
            eq(orderItems.productId, productId)
          )
        );

      await recalculateOrderTotal(order.id);
    },
    UPDATE_CART_ITEM_QUANTITY: async (
      productId: string,
      userId: string,
      quantity: number
    ) => {
      const order = await db.query.orders.findFirst({
        where: and(
          eq(orders.orderStatus, "cart"),
          eq(orders.createdBy, userId)
        ),
        columns: {
          id: true,
        },
      });

      if (!order) {
        return;
      }

      if (quantity <= 0) {
        await db
          .delete(orderItems)
          .where(
            and(
              eq(orderItems.orderId, order.id),
              eq(orderItems.productId, productId)
            )
          );
      } else {
        await db
          .update(orderItems)
          .set({
            quantity,
          })
          .where(
            and(
              eq(orderItems.orderId, order.id),
              eq(orderItems.productId, productId)
            )
          );
      }

      await recalculateOrderTotal(order.id);
    },
  },
};
